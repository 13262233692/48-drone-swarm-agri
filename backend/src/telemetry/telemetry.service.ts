import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import EventEmitter2 from 'eventemitter2'
import * as mqtt from 'mqtt'
import type { DroneTelemetry, FleetSummary, AlarmEvent, TrajectoryPoint } from '../shared/types.js'

const LOW_LIQUID_THRESHOLD = 0.15
const OFFLINE_TIMEOUT_MS = 10000
const MAX_TRAJECTORY_POINTS = 2000

@Injectable()
export class TelemetryService implements OnModuleInit, OnModuleDestroy {
  private droneStates = new Map<string, DroneTelemetry>()
  private trajectories = new Map<string, TrajectoryPoint[]>()
  private lastHeartbeat = new Map<string, number>()
  private mqttClient: mqtt.MqttClient | null = null
  private offlineCheckInterval: NodeJS.Timeout | null = null
  private summaryInterval: NodeJS.Timeout | null = null

  constructor(private eventEmitter: EventEmitter2) {}

  onModuleInit() {
    this.connectMqtt()
    this.startOfflineCheck()
    this.startSummaryBroadcast()
  }

  onModuleDestroy() {
    if (this.mqttClient) {
      this.mqttClient.end()
    }
    if (this.offlineCheckInterval) clearInterval(this.offlineCheckInterval)
    if (this.summaryInterval) clearInterval(this.summaryInterval)
  }

  private connectMqtt() {
    const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883'
    try {
      this.mqttClient = mqtt.connect(brokerUrl, {
        clientId: `nestjs-telemetry-${Date.now()}`,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 3000,
      })

      this.mqttClient.on('connect', () => {
        this.mqttClient!.subscribe('telemetry/#', { qos: 1 })
      })

      this.mqttClient.on('message', (topic, message) => {
        try {
          const data = JSON.parse(message.toString()) as DroneTelemetry
          this.processTelemetry(data)
        } catch {}
      })

      this.mqttClient.on('error', () => {})
    } catch {}
  }

  processTelemetry(data: DroneTelemetry) {
    const prev = this.droneStates.get(data.droneId)
    this.droneStates.set(data.droneId, data)
    this.lastHeartbeat.set(data.droneId, Date.now())

    const trajectory = this.trajectories.get(data.droneId) || []
    trajectory.push({ lat: data.lat, lng: data.lng, altitude: data.altitude, timestamp: data.timestamp })
    if (trajectory.length > MAX_TRAJECTORY_POINTS) trajectory.splice(0, trajectory.length - MAX_TRAJECTORY_POINTS)
    this.trajectories.set(data.droneId, trajectory)

    if (!prev && data.liquidRemain / data.liquidTotal < LOW_LIQUID_THRESHOLD) {
      this.emitAlarm({
        droneId: data.droneId,
        type: 'low_liquid',
        message: `无人机 ${data.droneId} 药量不足 ${(data.liquidRemain / data.liquidTotal * 100).toFixed(1)}%`,
        timestamp: Date.now(),
      })
    }
    if (prev && prev.liquidRemain / prev.liquidTotal >= LOW_LIQUID_THRESHOLD && data.liquidRemain / data.liquidTotal < LOW_LIQUID_THRESHOLD) {
      this.emitAlarm({
        droneId: data.droneId,
        type: 'low_liquid',
        message: `无人机 ${data.droneId} 药量不足 ${(data.liquidRemain / data.liquidTotal * 100).toFixed(1)}%`,
        timestamp: Date.now(),
      })
    }

    this.eventEmitter.emit('telemetry', data)
  }

  private emitAlarm(alarm: AlarmEvent) {
    this.eventEmitter.emit('alarm', alarm)
  }

  private startOfflineCheck() {
    this.offlineCheckInterval = setInterval(() => {
      const now = Date.now()
      for (const [droneId, lastTime] of this.lastHeartbeat) {
        if (now - lastTime > OFFLINE_TIMEOUT_MS) {
          const state = this.droneStates.get(droneId)
          if (state && state.status !== 'error') {
            this.droneStates.set(droneId, { ...state, status: 'error' })
            this.emitAlarm({
              droneId,
              type: 'offline',
              message: `无人机 ${droneId} 离线超过10秒`,
              timestamp: now,
            })
          }
        }
      }
    }, 3000)
  }

  private startSummaryBroadcast() {
    this.summaryInterval = setInterval(() => {
      const summary = this.getFleetSummary()
      this.eventEmitter.emit('fleet_summary', summary)
    }, 2000)
  }

  getFleetSummary(): FleetSummary {
    let online = 0
    let lowLiquid = 0
    let errorCount = 0
    const total = this.droneStates.size

    for (const state of this.droneStates.values()) {
      if (state.status !== 'idle' && state.status !== 'error') online++
      if (state.liquidRemain / state.liquidTotal < LOW_LIQUID_THRESHOLD) lowLiquid++
      if (state.status === 'error') errorCount++
    }

    return {
      total,
      online,
      lowLiquid,
      error: errorCount,
      totalArea: 1250,
      coveredArea: Math.round(online * 25 * 0.68),
    }
  }

  getAllDrones(): DroneTelemetry[] {
    return Array.from(this.droneStates.values())
  }

  getDrone(droneId: string): DroneTelemetry | undefined {
    return this.droneStates.get(droneId)
  }

  getTrajectory(droneId: string): TrajectoryPoint[] {
    return this.trajectories.get(droneId) || []
  }
}
