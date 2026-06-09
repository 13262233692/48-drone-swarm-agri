import { Module } from '@nestjs/common'
import { SimulatorService } from './simulator.service.js'
import { TelemetryModule } from '../telemetry/telemetry.module.js'

@Module({
  imports: [TelemetryModule],
  providers: [SimulatorService],
})
export class SimulatorModule {}
