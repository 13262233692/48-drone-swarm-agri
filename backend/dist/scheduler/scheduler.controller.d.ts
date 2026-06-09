import { SchedulerService } from './scheduler.service.js';
export declare class SchedulerController {
    private schedulerService;
    constructor(schedulerService: SchedulerService);
    getAssignments(): import("./scheduler.service.js").MissionAssignment[];
    getFailedDrones(): {
        failedDrones: string[];
    };
    simulateCrash(id: string): import("./scheduler.service.js").RescheduleResult | {
        error: string;
    };
    resetFailure(id: string): {
        success: boolean;
    };
}
