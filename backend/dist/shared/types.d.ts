export interface DroneTelemetry {
    droneId: string;
    lat: number;
    lng: number;
    altitude: number;
    liquidRemain: number;
    liquidTotal: number;
    speed: number;
    heading: number;
    status: 'idle' | 'flying' | 'returning' | 'error';
    timestamp: number;
}
export interface FleetSummary {
    total: number;
    online: number;
    lowLiquid: number;
    error: number;
    totalArea: number;
    coveredArea: number;
}
export interface AlarmEvent {
    droneId: string;
    type: 'low_liquid' | 'offline' | 'geofence_breach' | 'altitude_warning';
    message: string;
    timestamp: number;
}
export interface FarmBoundary {
    id: string;
    name: string;
    geojson: any;
    areaHectares: number;
}
export interface DroneInfo {
    droneId: string;
    model: string;
    status: DroneTelemetry['status'];
    currentMission: string | null;
    totalFlights: number;
    totalArea: number;
}
export interface TrajectoryPoint {
    lat: number;
    lng: number;
    altitude: number;
    timestamp: number;
}
