import { TelemetryService } from './telemetry.service.js';
export declare class TelemetryController {
    private telemetryService;
    constructor(telemetryService: TelemetryService);
    getAllDrones(): import("../shared/types.js").DroneTelemetry[];
    getDrone(id: string): import("../shared/types.js").DroneTelemetry | {
        error: string;
    };
    getTrajectory(id: string): {
        points: import("../shared/types.js").TrajectoryPoint[];
    };
}
