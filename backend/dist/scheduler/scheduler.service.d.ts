import { OnModuleInit } from '@nestjs/common';
import EventEmitter2 from 'eventemitter2';
import { TelemetryService } from '../telemetry/telemetry.service.js';
import { FarmsService } from '../farms/farms.service.js';
import { type Point, type VoronoiCell } from './geometry.js';
import type { AlarmEvent } from '../shared/types.js';
export interface MissionAssignment {
    droneId: string;
    farmId: string;
    cell: VoronoiCell;
    waypoints: Point[];
    areaHectares: number;
}
export interface RescheduleResult {
    triggerAlarm: AlarmEvent;
    failedDroneId: string;
    assignments: MissionAssignment[];
    totalArea: number;
    reassignedArea: number;
}
export declare class SchedulerService implements OnModuleInit {
    private eventEmitter;
    private telemetryService;
    private farmsService;
    private currentAssignments;
    private failedDrones;
    private rescheduleCount;
    constructor(eventEmitter: EventEmitter2, telemetryService: TelemetryService, farmsService: FarmsService);
    onModuleInit(): void;
    private handleDroneFailure;
    private triggerReschedule;
    reschedule(failedDroneId: string, reason: string): RescheduleResult | null;
    private polygonCenter;
    getCurrentAssignments(): MissionAssignment[];
    getFailedDrones(): string[];
    simulateCrash(droneId: string): RescheduleResult | null;
    resetFailure(droneId: string): void;
}
