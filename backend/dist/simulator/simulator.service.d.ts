import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import EventEmitter2 from 'eventemitter2';
export declare class SimulatorService implements OnModuleInit, OnModuleDestroy {
    private eventEmitter;
    private drones;
    private intervalId;
    constructor(eventEmitter: EventEmitter2);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private initDrones;
    private tick;
}
