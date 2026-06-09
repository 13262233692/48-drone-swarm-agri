import { Module } from '@nestjs/common'
import { TelemetryService } from './telemetry.service.js'
import { TelemetryController } from './telemetry.controller.js'
import { DedupService } from './dedup.service.js'

@Module({
  providers: [TelemetryService, DedupService],
  controllers: [TelemetryController],
  exports: [TelemetryService],
})
export class TelemetryModule {}
