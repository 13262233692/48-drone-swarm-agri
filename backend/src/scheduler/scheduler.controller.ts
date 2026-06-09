import { Controller, Get, Post, Param } from '@nestjs/common'
import { SchedulerService } from './scheduler.service.js'

@Controller('api/scheduler')
export class SchedulerController {
  constructor(private schedulerService: SchedulerService) {}

  @Get('assignments')
  getAssignments() {
    return this.schedulerService.getCurrentAssignments()
  }

  @Get('failed')
  getFailedDrones() {
    return { failedDrones: this.schedulerService.getFailedDrones() }
  }

  @Post('simulate-crash/:id')
  simulateCrash(@Param('id') id: string) {
    const result = this.schedulerService.simulateCrash(id)
    if (!result) return { error: 'Drone not found' }
    return result
  }

  @Post('reset/:id')
  resetFailure(@Param('id') id: string) {
    this.schedulerService.resetFailure(id)
    return { success: true }
  }
}
