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
import { Controller, Get, Post, Param } from '@nestjs/common';
import { SchedulerService } from './scheduler.service.js';
let SchedulerController = class SchedulerController {
    constructor(schedulerService) {
        this.schedulerService = schedulerService;
    }
    getAssignments() {
        return this.schedulerService.getCurrentAssignments();
    }
    getFailedDrones() {
        return { failedDrones: this.schedulerService.getFailedDrones() };
    }
    simulateCrash(id) {
        const result = this.schedulerService.simulateCrash(id);
        if (!result)
            return { error: 'Drone not found' };
        return result;
    }
    resetFailure(id) {
        this.schedulerService.resetFailure(id);
        return { success: true };
    }
};
__decorate([
    Get('assignments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "getAssignments", null);
__decorate([
    Get('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "getFailedDrones", null);
__decorate([
    Post('simulate-crash/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "simulateCrash", null);
__decorate([
    Post('reset/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "resetFailure", null);
SchedulerController = __decorate([
    Controller('api/scheduler'),
    __metadata("design:paramtypes", [SchedulerService])
], SchedulerController);
export { SchedulerController };
