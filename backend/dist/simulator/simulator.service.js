var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import EventEmitter2 from 'eventemitter2';
const DRONE_COUNT = 50;
const TELEMETRY_INTERVAL_MS = 500;
const LIQUID_DECREASE_PER_TICK = 30;
const LIQUID_TOTAL = 16000;
const REFILL_TIME_MS = 5000;
const LOW_LIQUID_THRESHOLD = 0.15;
const FARM_CENTERS = [
    { lat: 28.611, lng: 115.902 },
    { lat: 28.594, lng: 115.880 },
    { lat: 28.579, lng: 115.915 },
];
const DRONE_MODELS = ['DJI T40', 'DJI T30', 'XAircraft P80', 'DJI T40', 'DJI T30'];
let SimulatorService = class SimulatorService {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.drones = [];
        this.intervalId = null;
    }
    onModuleInit() {
        this.initDrones();
        this.intervalId = setInterval(() => this.tick(), TELEMETRY_INTERVAL_MS);
    }
    onModuleDestroy() {
        if (this.intervalId)
            clearInterval(this.intervalId);
        for (const d of this.drones) {
            if (d.refillTimer)
                clearTimeout(d.refillTimer);
        }
    }
    initDrones() {
        for (let i = 0; i < DRONE_COUNT; i++) {
            const farmIndex = i % FARM_CENTERS.length;
            const farm = FARM_CENTERS[farmIndex];
            const farmDrones = Math.ceil(DRONE_COUNT / FARM_CENTERS.length);
            const indexInFarm = Math.floor(i / FARM_CENTERS.length);
            const offsetLat = (indexInFarm % 8 - 3.5) * 0.0012;
            const offsetLng = (Math.floor(indexInFarm / 8) - 1.5) * 0.002;
            const startLat = farm.lat + offsetLat;
            const startLng = farm.lng + offsetLng;
            const sweepRow = indexInFarm;
            const sweepDirection = sweepRow % 2 === 0 ? 1 : -1;
            this.drones.push({
                droneId: `DRONE-${String(i + 1).padStart(3, '0')}`,
                lat: startLat,
                lng: startLng,
                altitude: 3 + Math.random() * 2,
                liquidRemain: LIQUID_TOTAL * (0.3 + Math.random() * 0.7),
                liquidTotal: LIQUID_TOTAL,
                speed: 5 + Math.random() * 3,
                heading: sweepDirection > 0 ? 90 : 270,
                status: 'flying',
                homeLat: farm.lat,
                homeLng: farm.lng,
                targetLat: startLat,
                targetLng: startLng + sweepDirection * 0.005,
                farmIndex,
                sweepRow,
                sweepDirection,
                sweepSpacing: 0.0008,
                rowLength: 0.008,
                isReturning: false,
                refilling: false,
                refillTimer: null,
                hue: (i * 360 / DRONE_COUNT) % 360,
                model: DRONE_MODELS[i % DRONE_MODELS.length],
            });
        }
    }
    tick() {
        for (const drone of this.drones) {
            if (drone.refilling)
                continue;
            if (drone.isReturning) {
                const dlat = drone.homeLat - drone.lat;
                const dlng = drone.homeLng - drone.lng;
                const dist = Math.sqrt(dlat * dlat + dlng * dlng);
                if (dist < 0.0005) {
                    drone.lat = drone.homeLat;
                    drone.lng = drone.homeLng;
                    drone.status = 'idle';
                    drone.isReturning = false;
                    drone.refilling = true;
                    drone.refillTimer = setTimeout(() => {
                        drone.liquidRemain = drone.liquidTotal;
                        drone.refilling = false;
                        drone.status = 'flying';
                        drone.sweepDirection = drone.sweepRow % 2 === 0 ? 1 : -1;
                        drone.heading = drone.sweepDirection > 0 ? 90 : 270;
                    }, REFILL_TIME_MS);
                    continue;
                }
                const stepLat = (dlat / dist) * 0.0003;
                const stepLng = (dlng / dist) * 0.0003;
                drone.lat += stepLat;
                drone.lng += stepLng;
                drone.heading = Math.atan2(dlng, dlat) * 180 / Math.PI;
                if (drone.heading < 0)
                    drone.heading += 360;
                drone.altitude = 5 + Math.random() * 0.5;
            }
            else if (drone.status === 'flying') {
                const stepSize = 0.00005 * (drone.speed / 6);
                drone.lat += Math.cos(drone.heading * Math.PI / 180) * stepSize;
                drone.lng += Math.sin(drone.heading * Math.PI / 180) * stepSize;
                const farm = FARM_CENTERS[drone.farmIndex];
                const dlat = Math.abs(drone.lat - farm.lat);
                if (dlat > drone.rowLength / 2) {
                    drone.sweepRow++;
                    drone.sweepDirection *= -1;
                    drone.lat += drone.sweepDirection * drone.sweepSpacing * 0.5;
                    drone.heading = drone.sweepDirection > 0 ? 90 : 270;
                }
                drone.liquidRemain = Math.max(0, drone.liquidRemain - LIQUID_DECREASE_PER_TICK);
                drone.altitude = 3 + Math.sin(Date.now() / 3000 + drone.sweepRow) * 0.5;
                drone.speed = 5 + Math.sin(Date.now() / 5000 + drone.sweepRow * 2) * 1.5;
                if (drone.liquidRemain / drone.liquidTotal < LOW_LIQUID_THRESHOLD) {
                    drone.isReturning = true;
                    drone.status = 'returning';
                }
            }
            const telemetry = {
                droneId: drone.droneId,
                lat: drone.lat,
                lng: drone.lng,
                altitude: Math.round(drone.altitude * 10) / 10,
                liquidRemain: Math.round(drone.liquidRemain),
                liquidTotal: drone.liquidTotal,
                speed: Math.round(drone.speed * 10) / 10,
                heading: Math.round(drone.heading * 10) / 10,
                status: drone.status,
                timestamp: Date.now(),
            };
            this.eventEmitter.emit('telemetry', telemetry);
        }
    }
};
SimulatorService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [EventEmitter2])
], SimulatorService);
export { SimulatorService };
