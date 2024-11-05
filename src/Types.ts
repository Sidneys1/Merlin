export type Point = [x: number, y: number];

export type Line = [start: Point, end: Point];

export type Rectangle = [x: number, y: number, w: number, h: number];

export abstract class PointMath {
    public static Floor(point: Point): Point {
        return [Math.floor(point[0]), Math.floor(point[1])];
    }
    public static dot(left: Point, right: Point): number {
        return (left[0] * right[0]) + (left[1] * right[1]);
    }
    public static div(left: Point, right: number): Point {
        return [left[0] / right, left[1] / right];
    }
    public static sub(left: Point, right: Point): Point {
        return [left[0] - right[0], left[1] - right[1]];
    }
    public static add(left: Point, right: Point): Point {
        return [left[0] + right[0], left[1] + right[1]];
    }
    public static mul(left: Point, right: number): Point {
        return [left[0] * right, left[1] * right];
    }
    public static Normalize(point: Point) {
        return this.div(point,Math.sqrt(this.dot(point, point)));
    }
    public static Length(point: Point): number {
        return Math.sqrt(this.dot(point, point));
    }

    public static LinesIntersect(A: Point, B: Point, C: Point, D: Point): boolean {
        const a = A[0];
        const b = A[1];
        const c = B[0];
        const d = B[1];
        const p = C[0];
        const q = C[1];
        const r = D[0];
        const s = D[1];

        var det, gamma, lambda;
        det = (c - a) * (s - q) - (r - p) * (d - b);
        if (det === 0) return false;
        lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
        gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
}

export enum MouseButton {
    Left,
    Middle,
    Right
}

