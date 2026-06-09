import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import EventEmitter2 from 'eventemitter2';
import type { DroneTelemetry, FleetSummary, TrajectoryPoint } from '../shared/types.js';
export declare class TelemetryService implements OnModuleInit, OnModuleDestroy {
    private eventEmitter;
    private droneStates;
    private trajectories;
    private lastHeartbeat;
    private mqttClient;
    private offlineCheckInterval;
    private summaryInterval;
    constructor(eventEmitter: EventEmitter2);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private connectMqtt;
    processTelemetry(data: DroneTelemetry): void;
    private emitAlarm;
    private startOfflineCheck;
    private startSummaryBroadcast;
    getFleetSummary(): FleetSummary;
    getAllDrones(): DroneTelemetry[];
    getDrone(droneId: string): DroneTelemetry | undefined;
    getTrajectory(droneId: string): TrajectoryPoint[];
}
