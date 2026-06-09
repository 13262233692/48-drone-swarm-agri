var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nestjs/common';
let FarmsService = class FarmsService {
    constructor() {
        this.farms = [
            {
                id: 'farm-001',
                name: '丰收农场-东区',
                areaHectares: 320,
                geojson: {
                    type: 'Polygon',
                    coordinates: [[
                            [115.892, 28.612], [115.894, 28.614], [115.896, 28.613], [115.898, 28.615],
                            [115.901, 28.614], [115.903, 28.616], [115.905, 28.615], [115.907, 28.617],
                            [115.909, 28.616], [115.911, 28.614], [115.912, 28.612], [115.911, 28.610],
                            [115.909, 28.608], [115.907, 28.607], [115.905, 28.606], [115.903, 28.607],
                            [115.901, 28.606], [115.898, 28.607], [115.896, 28.609], [115.894, 28.608],
                            [115.892, 28.610], [115.892, 28.612],
                        ]],
                },
            },
            {
                id: 'farm-002',
                name: '绿源农场-西区',
                areaHectares: 450,
                geojson: {
                    type: 'Polygon',
                    coordinates: [[
                            [115.870, 28.595], [115.873, 28.597], [115.876, 28.596], [115.878, 28.598],
                            [115.881, 28.597], [115.883, 28.599], [115.886, 28.598], [115.888, 28.600],
                            [115.890, 28.599], [115.891, 28.597], [115.890, 28.594], [115.888, 28.592],
                            [115.886, 28.591], [115.883, 28.590], [115.881, 28.591], [115.878, 28.590],
                            [115.876, 28.592], [115.873, 28.591], [115.870, 28.593], [115.869, 28.594],
                            [115.870, 28.595],
                        ]],
                },
            },
            {
                id: 'farm-003',
                name: '金穗农场-南区',
                areaHectares: 380,
                geojson: {
                    type: 'Polygon',
                    coordinates: [[
                            [115.905, 28.580], [115.908, 28.582], [115.911, 28.581], [115.913, 28.583],
                            [115.916, 28.582], [115.918, 28.584], [115.920, 28.583], [115.922, 28.585],
                            [115.924, 28.584], [115.925, 28.582], [115.924, 28.579], [115.922, 28.577],
                            [115.920, 28.576], [115.918, 28.575], [115.916, 28.576], [115.913, 28.575],
                            [115.911, 28.577], [115.908, 28.576], [115.905, 28.578], [115.904, 28.579],
                            [115.905, 28.580],
                        ]],
                },
            },
        ];
    }
    getAllFarms() {
        return this.farms;
    }
};
FarmsService = __decorate([
    Injectable()
], FarmsService);
export { FarmsService };
