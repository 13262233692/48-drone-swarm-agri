var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service.js';
import { SchedulerController } from './scheduler.controller.js';
import { TelemetryModule } from '../telemetry/telemetry.module.js';
import { FarmsModule } from '../farms/farms.module.js';
let SchedulerModule = class SchedulerModule {
};
SchedulerModule = __decorate([
    Module({
        imports: [TelemetryModule, FarmsModule],
        providers: [SchedulerService],
        controllers: [SchedulerController],
        exports: [SchedulerService],
    })
], SchedulerModule);
export { SchedulerModule };
