import { Injectable, OnModuleInit } from '@nestjs/common'
import EventEmitter2 from 'eventemitter2'
import { TelemetryService } from '../telemetry/telemetry.service.js'
import { FarmsService } from '../farms/farms.service.js'
import {
  computeClippedVoronoi,
  generateBoustrophedonWaypoints,
  polygonArea,
  type Point,
  type VoronoiCell,
} from './geometry.js'
import type { DroneTelemetry, AlarmEvent } from '../shared/types.js'

export interface MissionAssignment {
  droneId: string
  farmId: string
  cell: VoronoiCell
  waypoints: Point[]
  areaHectares: number
}

export interface RescheduleResult {
  triggerAlarm: AlarmEvent
  failedDroneId: string
  assignments: MissionAssignment[]
  totalArea: number
  reassignedArea: number
}

@Injectable()
export class SchedulerService implements OnModuleInit {
  private currentAssignments = new Map<string, MissionAssignment>()
  private failedDrones = new Set<string>()
  private rescheduleCount = 0

  constructor(
    private eventEmitter: EventEmitter2,
    private telemetryService: TelemetryService,
    private farmsService: FarmsService,
  ) {}

  onModuleInit() {
    this.eventEmitter.on('alarm', (alarm: AlarmEvent) => {
      if (alarm.type === 'offline' || alarm.type === 'low_liquid') {
        this.handleDroneFailure(alarm)
      }
    })

    this.eventEmitter.on('telemetry', (data: DroneTelemetry) => {
      if (data.status === 'error' && !this.failedDrones.has(data.droneId)) {
        this.failedDrones.add(data.droneId)
        this.triggerReschedule(data.droneId, `${data.droneId} 状态异常，触发编队重构`)
      }
    })
  }

  private handleDroneFailure(alarm: AlarmEvent) {
    const droneId = alarm.droneId
    if (this.failedDrones.has(droneId)) return

    const drone = this.telemetryService.getDrone(droneId)
    if (!drone || drone.status !== 'error') return

    this.failedDrones.add(droneId)
    this.triggerReschedule(droneId, alarm.message)
  }

  private triggerReschedule(failedDroneId: string, reason: string) {
    this.rescheduleCount++
    console.log(`[Scheduler] 🚨 触发编队重构 #${this.rescheduleCount}: ${failedDroneId} 退出 — ${reason}`)

    const result = this.reschedule(failedDroneId, reason)
    if (!result) return

    this.eventEmitter.emit('reschedule', result)
    this.eventEmitter.emit('alarm', {
      droneId: failedDroneId,
      type: 'geofence_breach',
      message: `编队重构完成：${result.assignments.length} 架存活无人机已重新分配作业区域`,
      timestamp: Date.now(),
    })
  }

  reschedule(failedDroneId: string, reason: string): RescheduleResult | null {
    const farms = this.farmsService.getAllFarms()
    if (farms.length === 0) return null

    const allDrones = this.telemetryService.getAllDrones()
    const activeDrones = allDrones.filter(
      d => d.status !== 'error' && !this.failedDrones.has(d.droneId),
    )

    if (activeDrones.length === 0) return null

    const assignments: MissionAssignment[] = []
    let reassignedArea = 0
    const assignedDrones = new Set<string>()

    for (const farm of farms) {
      const coordinates = farm.geojson.coordinates[0]
      const clipPolygon: Point[] = coordinates.map((c: number[]) => ({ x: c[0], y: c[1] }))

      const farmCenter = this.polygonCenter(clipPolygon)
      const maxDist = 0.02
      const farmDrones = activeDrones
        .filter(d => !assignedDrones.has(d.droneId))
        .filter(d => {
          const dist = Math.sqrt(Math.pow(d.lng - farmCenter.x, 2) + Math.pow(d.lat - farmCenter.y, 2))
          return dist < maxDist
        })

      if (farmDrones.length === 0) continue

      const seeds = farmDrones.map(d => ({
        droneId: d.droneId,
        x: d.lng,
        y: d.lat,
      }))

      let cells = computeClippedVoronoi(seeds, clipPolygon)

      if (cells.length === 0 && farmDrones.length > 0) {
        cells = seeds.map(s => ({
          droneId: s.droneId,
          polygon: { points: clipPolygon },
          center: { x: s.x, y: s.y },
        }))
        const areaPerDrone = polygonArea(clipPolygon) / seeds.length
        const areaHectaresPerDrone = areaPerDrone * 111000 * 111000 * Math.cos(28.6 * Math.PI / 180) / 10000
        for (const cell of cells) {
          const waypoints = generateBoustrophedonWaypoints(clipPolygon, 0.0008)
          const assignment: MissionAssignment = {
            droneId: cell.droneId,
            farmId: farm.id,
            cell,
            waypoints,
            areaHectares: Math.round(areaHectaresPerDrone * 100) / 100,
          }
          assignments.push(assignment)
          this.currentAssignments.set(cell.droneId, assignment)
          assignedDrones.add(cell.droneId)
          reassignedArea += areaHectaresPerDrone
        }
      } else {
        for (const cell of cells) {
          const area = polygonArea(cell.polygon.points)
          const areaHectares = area * 111000 * 111000 * Math.cos(28.6 * Math.PI / 180) / 10000

          const waypoints = generateBoustrophedonWaypoints(cell.polygon.points, 0.0008)

          const assignment: MissionAssignment = {
            droneId: cell.droneId,
            farmId: farm.id,
            cell,
            waypoints,
            areaHectares: Math.round(areaHectares * 100) / 100,
          }

          assignments.push(assignment)
          this.currentAssignments.set(cell.droneId, assignment)
          assignedDrones.add(cell.droneId)
          reassignedArea += areaHectares
        }
      }
    }

    console.log(`[Scheduler] ✅ 编队重构完成: ${assignments.length} 架存活无人机, 重新分配 ${reassignedArea.toFixed(1)} 公顷`)

    return {
      triggerAlarm: {
        droneId: failedDroneId,
        type: 'offline',
        message: reason,
        timestamp: Date.now(),
      },
      failedDroneId,
      assignments,
      totalArea: farms.reduce((s, f) => s + f.areaHectares, 0),
      reassignedArea: Math.round(reassignedArea * 100) / 100,
    }
  }

  private polygonCenter(polygon: Point[]): Point {
    let cx = 0, cy = 0
    for (const p of polygon) { cx += p.x; cy += p.y }
    return { x: cx / polygon.length, y: cy / polygon.length }
  }

  getCurrentAssignments(): MissionAssignment[] {
    return Array.from(this.currentAssignments.values())
  }

  getFailedDrones(): string[] {
    return Array.from(this.failedDrones)
  }

  simulateCrash(droneId: string): RescheduleResult | null {
    const drone = this.telemetryService.getDrone(droneId)
    if (!drone) return null

    this.failedDrones.add(droneId)
    const result = this.reschedule(droneId, `模拟炸机: ${droneId} 坠毁`)
    if (result) {
      this.eventEmitter.emit('reschedule', result)
    }
    return result
  }

  resetFailure(droneId: string) {
    this.failedDrones.delete(droneId)
  }
}
