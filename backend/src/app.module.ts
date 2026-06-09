import { Module } from '@nestjs/common'
import { TelemetryModule } from './telemetry/telemetry.module.js'
import { WsModule } from './ws/ws.module.js'
import { FarmsModule } from './farms/farms.module.js'
import { SimulatorModule } from './simulator/simulator.module.js'
import { EventsModule } from './events/events.module.js'

@Module({
  imports: [EventsModule, TelemetryModule, WsModule, FarmsModule, SimulatorModule],
})
export class AppModule {}
