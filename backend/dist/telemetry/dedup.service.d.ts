export declare class DedupService {
    private seenMessages;
    private lastProcessedTime;
    private lastSeqPerDrone;
    private cleanupCounter;
    computeFingerprint(droneId: string, timestamp: number, seq?: number): string;
    isDuplicate(droneId: string, timestamp: number, seq?: number): boolean;
    isRateLimited(droneId: string): boolean;
    private cleanup;
    getStats(): {
        dedupCacheSize: number;
        rateLimitedDrones: number;
    };
}
