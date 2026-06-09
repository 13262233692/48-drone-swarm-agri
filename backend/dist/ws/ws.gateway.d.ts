import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import EventEmitter2 from 'eventemitter2';
import { TelemetryService } from '../telemetry/telemetry.service.js';
export declare class WsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private eventEmitter;
    private telemetryService;
    server: Server;
    constructor(eventEmitter: EventEmitter2, telemetryService: TelemetryService);
    afterInit(): void;
    handleConnection(client: Socket): void;
    handleDisconnect(): void;
}
