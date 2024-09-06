import { IDrawable, IGame } from "./Interfaces.js";
import { Point } from "./Types.js";
import { Renderer } from "./Renderer.js";


export class Sprite implements IDrawable {
    public Asset: HTMLImageElement;
    public Pos: Point;
    Enabled: boolean = true;
    DrawPriority: number = 0;
    Layer: number = 0;

    constructor(asset: HTMLImageElement, pos: Point, layer?: number) {
        this.Asset = asset;
        this.Pos = pos;
        this.DrawPriority = (-this.Pos[1]) - 130;
        this.Layer = layer ?? 0;
    }

    Draw(elapsedTime: number): void {
        Renderer.DrawImage(this.Asset, this.Pos[0], this.Pos[1]);
    }
}
