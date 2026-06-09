import { Module } from '@nestjs/common'
import { SchedulerService } from './scheduler.service.js'
import { SchedulerController } from './scheduler.controller.js'
import { TelemetryModule } from '../telemetry/telemetry.module.js'
import { FarmsModule } from '../farms/farms.module.js'

@Module({
  imports: [TelemetryModule, FarmsModule],
  providers: [SchedulerService],
  controllers: [SchedulerController],
  exports: [SchedulerService],
})
export class SchedulerModule {}
