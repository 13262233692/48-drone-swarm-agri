import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { TelemetryService } from '../telemetry/telemetry.service.js';
export declare class SimulatorService implements OnModuleInit, OnModuleDestroy {
    private telemetryService;
    private drones;
    private intervalId;
    private seqCounter;
    constructor(telemetryService: TelemetryService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private initDrones;
    private tick;
}
