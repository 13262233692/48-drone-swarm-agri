export function sutherlandHodgman(subject, clip) {
    let output = ensureCCW([...subject]);
    const clipCCW = ensureCCW([...clip]);
    for (let i = 0; i < clipCCW.length; i++) {
        if (output.length === 0)
            return [];
        const input = [...output];
        output = [];
        const edgeStart = clipCCW[i];
        const edgeEnd = clipCCW[(i + 1) % clipCCW.length];
        for (let j = 0; j < input.length; j++) {
            const current = input[j];
            const previous = input[(j - 1 + input.length) % input.length];
            const currentInside = isInside(current, edgeStart, edgeEnd);
            const previousInside = isInside(previous, edgeStart, edgeEnd);
            if (currentInside) {
                if (!previousInside) {
                    const inter = lineIntersection(previous, current, edgeStart, edgeEnd);
                    if (inter)
                        output.push(inter);
                }
                output.push(current);
            }
            else if (previousInside) {
                const inter = lineIntersection(previous, current, edgeStart, edgeEnd);
                if (inter)
                    output.push(inter);
            }
        }
    }
    return output;
}
function ensureCCW(polygon) {
    let area = 0;
    for (let i = 0; i < polygon.length; i++) {
        const j = (i + 1) % polygon.length;
        area += polygon[i].x * polygon[j].y;
        area -= polygon[j].x * polygon[i].y;
    }
    if (area < 0)
        polygon.reverse();
    return polygon;
}
function isInside(point, edgeStart, edgeEnd) {
    return ((edgeEnd.x - edgeStart.x) * (point.y - edgeStart.y) -
        (edgeEnd.y - edgeStart.y) * (point.x - edgeStart.x)) >= 0;
}
function lineIntersection(p1, p2, p3, p4) {
    const x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y;
    const x3 = p3.x, y3 = p3.y, x4 = p4.x, y4 = p4.y;
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 1e-12)
        return null;
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1),
    };
}
import { Delaunay } from 'd3-delaunay';
export function computeClippedVoronoi(seeds, clipPolygon) {
    if (seeds.length === 0)
        return [];
    if (seeds.length === 1) {
        return [{
                droneId: seeds[0].droneId,
                polygon: { points: [...clipPolygon] },
                center: { x: seeds[0].x, y: seeds[0].y },
            }];
    }
    const xs = seeds.map(s => s.x);
    const ys = seeds.map(s => s.y);
    const minX = Math.min(...xs) - 0.02;
    const maxX = Math.max(...xs) + 0.02;
    const minY = Math.min(...ys) - 0.02;
    const maxY = Math.max(...ys) + 0.02;
    const delaunay = Delaunay.from(seeds, (s) => s.x, (s) => s.y);
    const voronoi = delaunay.voronoi([minX, minY, maxX, maxY]);
    const cells = [];
    for (let i = 0; i < seeds.length; i++) {
        const cellPolygon = voronoi.cellPolygon(i);
        if (!cellPolygon)
            continue;
        const cellPoints = [];
        for (let j = 0; j < cellPolygon.length - 1; j++) {
            cellPoints.push({ x: cellPolygon[j][0], y: cellPolygon[j][1] });
        }
        const clipped = sutherlandHodgman(cellPoints, clipPolygon);
        if (clipped.length < 3)
            continue;
        cells.push({
            droneId: seeds[i].droneId,
            polygon: { points: clipped },
            center: { x: seeds[i].x, y: seeds[i].y },
        });
    }
    return cells;
}
export function polygonArea(polygon) {
    let area = 0;
    const n = polygon.length;
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += polygon[i].x * polygon[j].y;
        area -= polygon[j].x * polygon[i].y;
    }
    return Math.abs(area) / 2;
}
export function polygonCentroid(polygon) {
    let cx = 0, cy = 0;
    for (const p of polygon) {
        cx += p.x;
        cy += p.y;
    }
    return { x: cx / polygon.length, y: cy / polygon.length };
}
export function generateBoustrophedonWaypoints(polygon, spacing) {
    if (polygon.length < 3)
        return [];
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    for (const p of polygon) {
        if (p.x < minX)
            minX = p.x;
        if (p.x > maxX)
            maxX = p.x;
        if (p.y < minY)
            minY = p.y;
        if (p.y > maxY)
            maxY = p.y;
    }
    const waypoints = [];
    let forward = true;
    let y = minY + spacing;
    while (y < maxY - spacing * 0.5) {
        const intersections = [];
        for (let i = 0; i < polygon.length; i++) {
            const j = (i + 1) % polygon.length;
            const p1 = polygon[i], p2 = polygon[j];
            if ((p1.y <= y && p2.y > y) || (p2.y <= y && p1.y > y)) {
                const t = (y - p1.y) / (p2.y - p1.y);
                intersections.push(p1.x + t * (p2.x - p1.x));
            }
        }
        intersections.sort((a, b) => a - b);
        for (let k = 0; k < intersections.length - 1; k += 2) {
            const x1 = intersections[k] + spacing * 0.1;
            const x2 = intersections[k + 1] - spacing * 0.1;
            if (x1 >= x2)
                continue;
            if (forward) {
                waypoints.push({ x: x1, y });
                waypoints.push({ x: x2, y });
            }
            else {
                waypoints.push({ x: x2, y });
                waypoints.push({ x: x1, y });
            }
        }
        forward = !forward;
        y += spacing;
    }
    return waypoints;
}
