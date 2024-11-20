// import { IDrawable, IGame } from "./Interfaces.js";
import { Point } from "./Types.js";
import { Renderer } from "./Renderer.js";


// export class Sprite implements IDrawable {
//     public Asset: HTMLImageElement;
//     public Pos: Point;
//     Enabled: boolean = true;
//     DrawPriority: number = 0;
//     Layer: number = 0;

//     constructor(asset: HTMLImageElement, pos: Point, layer?: number) {
//         this.Asset = asset;
//         this.Pos = pos;
//         this.DrawPriority = (-this.Pos[1]) - 130;
//         this.Layer = layer ?? 0;
//     }

//     Draw(elapsedTime: number): void {
//         Renderer.DrawImage(this.Asset, this.Pos[0], this.Pos[1]);
//     }
// }

export class Sprite {
    protected _asset: HTMLImageElement;
    protected _size: Point;
    public get Size(): Point { return this._size; };

    constructor(asset: HTMLImageElement|Promise<HTMLImageElement>) {
        if (asset instanceof Promise) {
            this._size = [-1, -1];
            //@ts-ignore
            this._asset = null;
            asset.then(value => {
                this._asset = value;
                this._size = [value.width, value.height];
            });
        } else {
            this._asset = asset;
            this._size = [asset.width, asset.height];
        }
    }

    public Draw(position: Point): void;
    public Draw(position: Point, size: Point): void;
    public Draw(position: Point, size?: Point): void {
        if (size !== undefined)
            Renderer.Ctx.drawImage(this._asset, ...position, ...size);
        else
            Renderer.Ctx.drawImage(this._asset, ...position);
    }
}

export class SpriteSheet extends Sprite {
    // public index = 0;
    protected _index = 0;
    public get Index(): number { return this._index; }
    public set Index(value: number) { this._index = (value % this._max_index); }

    protected _horizontal_tiles: number;
    protected _max_index: number;

    constructor(asset: HTMLImageElement|Promise<HTMLImageElement>, repeats: Point, props?: {count?:number}) {
        super(asset);
        if (asset instanceof Promise) {
            this._horizontal_tiles = -1;
            this._max_index = -1;
            asset.then(_ => {
                if (this._size[0] % repeats[0] !== 0 || this._size[1] % repeats[1] !== 0)
                    throw "Spritesheet is not properly dimensioned!"
                this._size = [this._size[0] / repeats[0], this._size[1] / repeats[1]];
                this._horizontal_tiles = repeats[0];
                this._max_index = props?.count ?? repeats[0] * repeats[1];
            });
        }
        else {
            if (this._size[0] % repeats[0] !== 0 || this._size[1] % repeats[1] !== 0)
                throw "Spritesheet is not properly dimensioned!"
            this._size = [this._size[0] / repeats[0], this._size[1] / repeats[1]];
            this._horizontal_tiles = repeats[0];
            this._max_index = props?.count ?? repeats[0] * repeats[1];
        }
    }

    public DrawIndex(index: number, position: Point): void;
    public DrawIndex(index: number, position: Point, size: Point): void;
    public DrawIndex(index: number, position: Point, size?: Point): void {
        const y = Math.floor((index % this._max_index) / this._horizontal_tiles);
        const x = (index % this._max_index) % this._horizontal_tiles;
        Renderer.Ctx.drawImage(this._asset, x * this._size[0], y * this._size[1], ...this._size, ...position, ...size ?? this._size);
    }

    override Draw(position: Point): void;
    override Draw(position: Point, size: Point): void;
    override Draw(position: Point, size?: Point): void {
        const y = Math.floor(this._index / this._horizontal_tiles);
        const x = this._index % this._horizontal_tiles;
        Renderer.Ctx.drawImage(this._asset, x * this._size[0], y * this._size[1], ...this._size, ...position, ...size ?? this._size);
    }
}