import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import EventEmitter2 from 'eventemitter2'
import { TelemetryService } from '../telemetry/telemetry.service.js'

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/' })
export class WsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  constructor(
    private eventEmitter: EventEmitter2,
    private telemetryService: TelemetryService,
  ) {}

  afterInit() {
    this.eventEmitter.on('telemetry', (data: any) => {
      this.server.emit('telemetry', data)
    })

    this.eventEmitter.on('fleet_summary', (data: any) => {
      this.server.emit('fleet_summary', data)
    })

    this.eventEmitter.on('alarm', (data: any) => {
      this.server.emit('alarm', data)
    })

    this.eventEmitter.on('reschedule', (data: any) => {
      this.server.emit('reschedule', data)
    })
  }

  handleConnection(client: Socket) {
    const allDrones = this.telemetryService.getAllDrones()
    client.emit('init', allDrones)
    const summary = this.telemetryService.getFleetSummary()
    client.emit('fleet_summary', summary)
  }

  handleDisconnect() {}
}
