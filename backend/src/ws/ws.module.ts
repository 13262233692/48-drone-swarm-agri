import { Module } from '@nestjs/common'
import { WsGateway } from './ws.gateway.js'
import { TelemetryModule } from '../telemetry/telemetry.module.js'

@Module({
  imports: [TelemetryModule],
  providers: [WsGateway],
})
export class WsModule {}
