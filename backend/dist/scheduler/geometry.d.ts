export interface Point {
    x: number;
    y: number;
}
export interface Polygon {
    points: Point[];
}
export interface VoronoiCell {
    droneId: string;
    polygon: Polygon;
    center: Point;
}
export declare function sutherlandHodgman(subject: Point[], clip: Point[]): Point[];
export declare function computeClippedVoronoi(seeds: {
    droneId: string;
    x: number;
    y: number;
}[], clipPolygon: Point[]): VoronoiCell[];
export declare function polygonArea(polygon: Point[]): number;
export declare function polygonCentroid(polygon: Point[]): Point;
export declare function generateBoustrophedonWaypoints(polygon: Point[], spacing: number): Point[];
