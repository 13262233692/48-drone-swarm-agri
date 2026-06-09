var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { WebSocketGateway, WebSocketServer, } from '@nestjs/websockets';
import { Server } from 'socket.io';
import EventEmitter2 from 'eventemitter2';
import { TelemetryService } from '../telemetry/telemetry.service.js';
let WsGateway = class WsGateway {
    constructor(eventEmitter, telemetryService) {
        this.eventEmitter = eventEmitter;
        this.telemetryService = telemetryService;
    }
    afterInit() {
        this.eventEmitter.on('telemetry', (data) => {
            this.server.emit('telemetry', data);
        });
        this.eventEmitter.on('fleet_summary', (data) => {
            this.server.emit('fleet_summary', data);
        });
        this.eventEmitter.on('alarm', (data) => {
            this.server.emit('alarm', data);
        });
        this.eventEmitter.on('reschedule', (data) => {
            this.server.emit('reschedule', data);
        });
    }
    handleConnection(client) {
        const allDrones = this.telemetryService.getAllDrones();
        client.emit('init', allDrones);
        const summary = this.telemetryService.getFleetSummary();
        client.emit('fleet_summary', summary);
    }
    handleDisconnect() { }
};
__decorate([
    WebSocketServer(),
    __metadata("design:type", Server)
], WsGateway.prototype, "server", void 0);
WsGateway = __decorate([
    WebSocketGateway({ cors: { origin: '*' }, namespace: '/' }),
    __metadata("design:paramtypes", [EventEmitter2,
        TelemetryService])
], WsGateway);
export { WsGateway };
