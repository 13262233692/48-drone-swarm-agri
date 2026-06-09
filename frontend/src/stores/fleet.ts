import { defineStore } from 'pinia'
import { reactive, ref, computed } from 'vue'
import { io, Socket } from 'socket.io-client'
import type { DroneTelemetry, FleetSummary, AlarmEvent, FarmBoundary, DroneInfo } from '@/shared/types'

const API_BASE = import.meta.env.DEV ? '' : 'http://localhost:3000'

export const useFleetStore = defineStore('fleet', () => {
  const drones = reactive<Map<string, DroneTelemetry>>(new Map())
  const droneInfos = reactive<Map<string, DroneInfo>>(new Map())
  const summary = reactive<FleetSummary>({
    total: 50,
    online: 0,
    lowLiquid: 0,
    error: 0,
    totalArea: 0,
    coveredArea: 0,
  })
  const alarms = reactive<AlarmEvent[]>([])
  const farms = reactive<FarmBoundary[]>([])
  const connected = ref(false)

  let socket: Socket | null = null

  const onlineDrones = computed(() => {
    const list: DroneTelemetry[] = []
    drones.forEach((d) => {
      if (d.status !== 'error') list.push(d)
    })
    return list
  })

  const lowLiquidDrones = computed(() => {
    const list: DroneTelemetry[] = []
    drones.forEach((d) => {
      if (d.liquidTotal > 0 && d.liquidRemain / d.liquidTotal < 0.15) list.push(d)
    })
    return list
  })

  const errorDrones = computed(() => {
    const list: DroneTelemetry[] = []
    drones.forEach((d) => {
      if (d.status === 'error') list.push(d)
    })
    return list
  })

  const averageLiquid = computed(() => {
    let total = 0
    let count = 0
    drones.forEach((d) => {
      if (d.liquidTotal > 0) {
        total += d.liquidRemain / d.liquidTotal
        count++
      }
    })
    return count > 0 ? total / count : 0
  })

  const missionEfficiency = computed(() => {
    if (summary.totalArea === 0) return 0
    return Math.min(100, (summary.coveredArea / summary.totalArea) * 100)
  })

  function initDroneInfos() {
    const models = ['DJI AGRAS T40', 'DJI AGRAS T30', 'DJI AGRAS T20', 'XAG P80', 'XAG P40']
    for (let i = 1; i <= 50; i++) {
      const id = `DRONE-${String(i).padStart(3, '0')}`
      droneInfos.set(id, {
        droneId: id,
        model: models[i % models.length],
        status: 'idle',
        currentMission: i <= 30 ? `SPRAY-AREA-${String(Math.ceil(i / 5)).padStart(2, '0')}` : null,
        totalFlights: Math.floor(Math.random() * 200 + 50),
        totalArea: Math.floor(Math.random() * 500 + 100),
      })
    }
  }

  function connect() {
    if (socket?.connected) return

    socket = io(API_BASE, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    })

    socket.on('connect', () => {
      connected.value = true
    })

    socket.on('disconnect', () => {
      connected.value = false
    })

    socket.on('telemetry', (data: DroneTelemetry) => {
      drones.set(data.droneId, data)
      const info = droneInfos.get(data.droneId)
      if (info) {
        info.status = data.status
      }
    })

    socket.on('fleet_summary', (data: FleetSummary) => {
      Object.assign(summary, data)
    })

    socket.on('alarm', (data: AlarmEvent) => {
      alarms.unshift(data)
      if (alarms.length > 100) alarms.pop()
    })

    socket.on('reconnect_attempt', () => {
      connected.value = false
    })
  }

  function disconnect() {
    if (socket) {
      socket.disconnect()
      socket = null
      connected.value = false
    }
  }

  async function fetchFarms() {
    try {
      const res = await fetch(`${API_BASE}/api/farms`)
      const data = await res.json()
      farms.splice(0, farms.length, ...data)
    } catch (e) {
      console.warn('Failed to fetch farms:', e)
    }
  }

  function getDroneInfo(droneId: string): DroneInfo | undefined {
    return droneInfos.get(droneId)
  }

  function getDroneTelemetry(droneId: string): DroneTelemetry | undefined {
    return drones.get(droneId)
  }

  initDroneInfos()
  connect()
  fetchFarms()

  return {
    drones,
    droneInfos,
    summary,
    alarms,
    farms,
    connected,
    onlineDrones,
    lowLiquidDrones,
    errorDrones,
    averageLiquid,
    missionEfficiency,
    connect,
    disconnect,
    fetchFarms,
    getDroneInfo,
    getDroneTelemetry,
  }
})
