export class Renderer {
    public readonly Canvas: HTMLCanvasElement|OffscreenCanvas;
    public readonly Ctx: CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D;

    public static get Canvas() { return Renderer.Default.Canvas; }
    public static get Ctx() { return Renderer.Default.Ctx; }
    
    private _width: number;
    public get Width() { return this._width; }
    public static get Width() { return Renderer.Default._width; }

    private _height: number;
    public get Height() { return this._height; }
    public static get Height() { return Renderer.Default._height; }

    public get PixelRatio(): number {
        const dpr = window.devicePixelRatio || 1;
        const bsr = this.Ctx.backingStorePixelRatio ||
                    this.Ctx.webkitBackingStorePixelRatio ||
                    this.Ctx.mozBackingStorePixelRatio ||
                    this.Ctx.msBackingStorePixelRatio ||
                    this.Ctx.oBackingStorePixelRatio ||
                    1;
        return dpr / bsr;
    }

    private _hiDpi = false;
    public get HiDpi() { return this._hiDpi; }
    public ResizeCanvas(): void {
        if (this._hiDpi) {
            console.debug("Already resized canvas.");
            return;
        }
        const ratio = this.PixelRatio;
        if (ratio === 1) {
            console.debug("Not resizing canvas (pixel ratio is 1x).");
            return;
        }
        console.debug(`Resizing canvas (pixel ratio: ${ratio})...`);
        this._width = this.Canvas.width;
        this._height = this.Canvas.height;
        this.Canvas.width = this.Canvas.width * ratio;
        this.Canvas.height = this.Canvas.height * ratio;
        console.debug(`Canvas display dimensions: ${this._width}x${this._height}; Image dimensions: ${this.Canvas.width}x${this.Canvas.height}.`)
        this._hiDpi = true;

        this.Ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    private static _singleton: Renderer;
    public static get Default(): Renderer {
        return Renderer._singleton ?? (Renderer._singleton = new Renderer('canvas'));
    }

    constructor(target: HTMLCanvasElement|OffscreenCanvas|string, options?: CanvasRenderingContext2DSettings, ratio?: number) {
        if (typeof target === 'string') {
            const canvas = document.getElementById(target);
            if (canvas === null || !(canvas instanceof HTMLCanvasElement))
                throw "Could not get canvas by ID.";
            target = canvas;
        }
        this.Canvas = target;
        this._width = target.width;
        this._height = target.height;
        const context = target.getContext('2d', options);
        if (context === null) throw "Could not create 2D canvas context.";
        this.Ctx = context;

        if (ratio !== undefined && ratio !== 1) {
            console.debug(`Resizing canvas in ctor (pixel ratio: ${ratio})...`);
            this._width = this.Canvas.width;
            this._height = this.Canvas.height;
            this.Canvas.width = this.Canvas.width * ratio;
            this.Canvas.height = this.Canvas.height * ratio;
            this._hiDpi = true;

            this.Ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        }
    }

    public static CreateOffscreenCanvas(width: number, height: number, options?: CanvasRenderingContext2DSettings, ratio?: number): Renderer {
        if (ratio === undefined) 
            ratio = Renderer.Default.PixelRatio;
        return new Renderer(new OffscreenCanvas(width * ratio, height * ratio), options, ratio);
    }

    public Clear(color: string = "magenta"): void {
        this.Ctx.fillStyle = color;
        this.Ctx.fillRect(0, 0, this.Width, this.Height);
    }

    public static Clear(color: string = "magenta"): void {
        Renderer.Default.Clear(color);
    }
}

// export class Renderer {
//     private static _canvas: HTMLCanvasElement;
//     public static get Canvas(): HTMLCanvasElement {
//         if (this._canvas === undefined) {
//             const canvas = document.getElementById("canvas");

//             if (canvas === null || !(canvas instanceof HTMLCanvasElement))
//                 throw "Could not find a canvas with id='canvas'.";
    
//             this._canvas = canvas;
//         }
//         return this._canvas;
//     }

//     public static _ctx: CanvasRenderingContext2D;
//     public static get Ctx(): CanvasRenderingContext2D {
//         if (this._ctx === undefined) {
//             const ctx = this.Canvas.getContext("2d", {alpha: false});
//             if (ctx === null)
//                 throw "Could not get canvas context.";
//             this._ctx = ctx;
//         }
//         return this._ctx;
//     }

//     private static _width = this.Canvas.width;
//     public static get Width(): number { return this._width; }

//     private static _height = this.Canvas.height;
//     public static get Height(): number { return this._height; }

//     public static get PixelRatio(): number {
//         const ctx = this.Ctx;
//         const dpr = window.devicePixelRatio || 1;
//         const bsr = ctx.backingStorePixelRatio ||
//                     ctx.webkitBackingStorePixelRatio ||
//                     ctx.mozBackingStorePixelRatio ||
//                     ctx.msBackingStorePixelRatio ||
//                     ctx.oBackingStorePixelRatio ||
//                     1;
//         return dpr / bsr;
//     }

//     private static _hiDpi = false;
//     public static get HiDpi() {return this._hiDpi;}
//     public static ResizeCanvas(): void {
//         const ratio = this.PixelRatio;
//         if (ratio === 1) {
//             console.debug("Not resizing canvas (pixel ratio is 1x).");
//             return;
//         }
//         console.debug(`Resizing canvas (pixel ratio: ${ratio})...`);
//         const can = this.Canvas;
//         this._width = can.width;
//         this._height = can.height;
//         can.width = can.width * ratio;
//         can.height = can.height * ratio;
//         this._hiDpi = true;

//         this.Ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
//     }

//     private constructor() {}

//     private static _singleton: Renderer;
//     public static get S(): Renderer {
//         return this._singleton || (this._singleton = new this());
//     }

//     static MeasureText(font: string, text: string): TextMetrics {
//         this.Ctx.font = font;
//         return this.Ctx.measureText(text);
//     }

//     static DrawText(color: string|CanvasGradient, font: string, x: number, y: number, text: string, maxWidth?: number) { 
//         this.Ctx.fillStyle = color;
//         this.Ctx.font = font;
//         this.Ctx.fillText(text, x, y, maxWidth);
//     }

//     static Clear(color: string = "magenta") {
//         this.Ctx.fillStyle = color;
//         this.Ctx.fillRect(0, 0, this.Width, this.Height);
//     }

//     static DrawImage(image: CanvasImageSource, x: number, y: number, w?: number, h?: number, opacity = 1) {
//         const restore = this.Ctx.globalAlpha;
//         this.Ctx.globalAlpha = opacity;
//         if (w !== undefined && h !== undefined)
//             this.Ctx.drawImage(image, x, y, w, h);
//         else
//             this.Ctx.drawImage(image, x, y);
//         this.Ctx.globalAlpha = restore;
//     }

//     static FillRect(color: string | CanvasGradient | CanvasPattern, x: number, y: number, w: number, h: number, opacity = 1) {
//         const restore = this.Ctx.globalAlpha;
//         this.Ctx.globalAlpha = opacity;
//         this.Ctx.fillStyle = color;
//         this.Ctx.fillRect(x, y, w, h);
//         this.Ctx.globalAlpha = restore;
//     }

//     static DrawRect(stroke: string, x: number, y: number, w: number, h: number, opacity = 1) {
//         const restore = this.Ctx.globalAlpha;
//         this.Ctx.globalAlpha = opacity;
//         this.Ctx.strokeStyle = stroke;
//         this.Ctx.strokeRect(x, y, w, h);
//         this.Ctx.globalAlpha = restore;
//     }

//     static DrawLine(stroke: string, sx: number, sy: number, ex: number, ey: number) {
//         this.Ctx.strokeStyle = stroke;
//         this.Ctx.beginPath();
//         this.Ctx.moveTo(sx, sy);
//         this.Ctx.lineTo(ex, ey);
//         this.Ctx.stroke();
//     }

//     static FillEllipse(color: string, x: number, y: number, rx: number, ry: number) {
//         this.Ctx.fillStyle = color;
//         this.Ctx.beginPath();
//         this.Ctx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
//         this.Ctx.fill();
//     }

//     static DrawEllipse(stroke: string, x: number, y: number, rx: number, ry: number) {
//         this.Ctx.strokeStyle = stroke;
//         this.Ctx.beginPath();
//         this.Ctx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
//         this.Ctx.stroke();
//     }

//     static FillCircle(color: string, x: number, y: number, radius: number) {
//         this.Ctx.fillStyle = color;
//         this.Ctx.beginPath();
//         this.Ctx.arc(x, y, radius, 0, 2* Math.PI);
//         this.Ctx.fill();
//     }
// }
