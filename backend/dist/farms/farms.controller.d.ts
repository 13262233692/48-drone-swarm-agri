import { FarmsService } from './farms.service.js';
export declare class FarmsController {
    private farmsService;
    constructor(farmsService: FarmsService);
    getAllFarms(): import("../shared/types.js").FarmBoundary[];
}
