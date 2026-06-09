var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Param } from '@nestjs/common';
import { TelemetryService } from './telemetry.service.js';
let TelemetryController = class TelemetryController {
    constructor(telemetryService) {
        this.telemetryService = telemetryService;
    }
    getAllDrones() {
        return this.telemetryService.getAllDrones();
    }
    getDrone(id) {
        return this.telemetryService.getDrone(id) || { error: 'Drone not found' };
    }
    getTrajectory(id) {
        return { points: this.telemetryService.getTrajectory(id) };
    }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TelemetryController.prototype, "getAllDrones", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TelemetryController.prototype, "getDrone", null);
__decorate([
    Get(':id/trajectory'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TelemetryController.prototype, "getTrajectory", null);
TelemetryController = __decorate([
    Controller('api/drones'),
    __metadata("design:paramtypes", [TelemetryService])
], TelemetryController);
export { TelemetryController };
