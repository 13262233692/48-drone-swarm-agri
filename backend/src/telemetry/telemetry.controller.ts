import { Controller, Get, Param } from '@nestjs/common'
import { TelemetryService } from './telemetry.service.js'

@Controller('api/drones')
export class TelemetryController {
  constructor(private telemetryService: TelemetryService) {}

  @Get()
  getAllDrones() {
    return this.telemetryService.getAllDrones()
  }

  @Get(':id')
  getDrone(@Param('id') id: string) {
    return this.telemetryService.getDrone(id) || { error: 'Drone not found' }
  }

  @Get(':id/trajectory')
  getTrajectory(@Param('id') id: string) {
    return { points: this.telemetryService.getTrajectory(id) }
  }
}
