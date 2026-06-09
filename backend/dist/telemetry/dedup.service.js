var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nestjs/common';
const DEDUP_TTL_MS = 10000;
const DEDUP_MAX_ENTRIES = 5000;
const RATE_LIMIT_PER_DRONE_MS = 200;
let DedupService = class DedupService {
    constructor() {
        this.seenMessages = new Map();
        this.lastProcessedTime = new Map();
        this.lastSeqPerDrone = new Map();
        this.cleanupCounter = 0;
    }
    computeFingerprint(droneId, timestamp, seq) {
        if (seq !== undefined) {
            return `${droneId}::seq::${seq}`;
        }
        return `${droneId}::ts::${timestamp}`;
    }
    isDuplicate(droneId, timestamp, seq) {
        const fp = this.computeFingerprint(droneId, timestamp, seq);
        const now = Date.now();
        if (this.seenMessages.has(fp)) {
            return true;
        }
        if (seq !== undefined) {
            const lastSeq = this.lastSeqPerDrone.get(droneId);
            if (lastSeq !== undefined && seq <= lastSeq) {
                return true;
            }
            this.lastSeqPerDrone.set(droneId, seq);
        }
        this.seenMessages.set(fp, now);
        this.cleanupCounter++;
        if (this.cleanupCounter >= 100) {
            this.cleanup();
            this.cleanupCounter = 0;
        }
        return false;
    }
    isRateLimited(droneId) {
        const now = Date.now();
        const lastTime = this.lastProcessedTime.get(droneId);
        if (lastTime !== undefined && now - lastTime < RATE_LIMIT_PER_DRONE_MS) {
            return true;
        }
        this.lastProcessedTime.set(droneId, now);
        return false;
    }
    cleanup() {
        const now = Date.now();
        const expired = [];
        for (const [fp, ts] of this.seenMessages) {
            if (now - ts > DEDUP_TTL_MS) {
                expired.push(fp);
            }
        }
        for (const fp of expired) {
            this.seenMessages.delete(fp);
        }
        if (this.seenMessages.size > DEDUP_MAX_ENTRIES) {
            const entries = Array.from(this.seenMessages.entries())
                .sort((a, b) => a[1] - b[1]);
            const toRemove = entries.slice(0, entries.length - DEDUP_MAX_ENTRIES);
            for (const [fp] of toRemove) {
                this.seenMessages.delete(fp);
            }
        }
    }
    getStats() {
        return {
            dedupCacheSize: this.seenMessages.size,
            rateLimitedDrones: this.lastProcessedTime.size,
        };
    }
};
DedupService = __decorate([
    Injectable()
], DedupService);
export { DedupService };
