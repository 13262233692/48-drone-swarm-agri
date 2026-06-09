import { Module } from '@nestjs/common'
import { TelemetryModule } from './telemetry/telemetry.module.js'
import { WsModule } from './ws/ws.module.js'
import { FarmsModule } from './farms/farms.module.js'
import { SimulatorModule } from './simulator/simulator.module.js'
import { EventsModule } from './events/events.module.js'
import { SchedulerModule } from './scheduler/scheduler.module.js'

@Module({
  imports: [EventsModule, TelemetryModule, WsModule, FarmsModule, SchedulerModule, SimulatorModule],
})
export class AppModule {}
