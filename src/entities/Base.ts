import { Line, Point, PointMath } from "../Types.js";
import { IDrawable,  IUpdatable } from "../Interfaces.js";

export abstract class Entity implements IDrawable, IUpdatable {
    public Enabled: boolean = true;
    public DrawPriority: number;
    public Priority: number;
    public Layer: number = 0;
    public DrawOffset: Point = [0, 0];

    public Pos: Point;
    public Size: Point;

    constructor(pos: Point, size: Point, priority = 0, drawPriority = 0) {
        this.Pos = pos;
        this.Size = size;
        this.Priority = priority;
        this.DrawPriority = drawPriority;
    }

    abstract Update(elapsedTime: number): void;
    DisabledUpdate(elapsedTime: number): void {}
    abstract Draw(elapsedTime: number): void;

    Left(): number {
        return this.Pos[0] - this.DrawOffset[0];
    }
    Right(): number {
        return this.Pos[0] + this.Size[0] - this.DrawOffset[0];
    }

    Bottom(): number {
        return this.Pos[1] - this.DrawOffset[1];
    }
    Top(): number {
        return this.Pos[1] + this.Size[1] - this.DrawOffset[1];
    }
}
