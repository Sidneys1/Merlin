import { IGame, IRemoveable } from '../Interfaces.js'
import { DrawableGameModule } from "../GameModule.js";
import { DEBUG_FONT, MAX_DEBUG_FRAME_TIMES } from '../Constants.js';
import { Renderer } from '../Renderer.js';
import { InputManager } from './InputManager.js';
import { RingBuffer } from 'ring-buffer-ts';

export interface IDebugDrawable extends IRemoveable {
    DebugDraw(): void;
}

export class DebugModule extends DrawableGameModule {
    Fps: number = NaN;

    private _game: IGame;
    private totalFrames: number = 0;
    private elapsedTime: number = 0;
    private textHeight: number;

    private ExtraDebugText = new Map<IRemoveable, () => string[]>();
    private ExtraDebugDraw = new Map<IRemoveable, () => void>();
    
    public FrameTimes = new RingBuffer<number>(MAX_DEBUG_FRAME_TIMES);
    public ElapsedTimes = new RingBuffer<number>(MAX_DEBUG_FRAME_TIMES);

    public static S?: DebugModule;

    constructor(game: IGame) {
        super(true, -9999, -9999);

        this._game = game;

        Renderer.Ctx.font = DEBUG_FONT;
        this.textHeight = 10 + Renderer.Ctx.measureText('0').actualBoundingBoxAscent;

        DebugModule.S = this;


        this.FrameTimes.add(0);
    }

    Draw(_: number): void {
        this.totalFrames++;

        // const ctx = Renderer.Ctx;
        for (const entity of this._game.State?.Entities ?? []) {
            Renderer.Ctx.fillStyle = 'red';
            Renderer.Ctx.beginPath();
            Renderer.Ctx.arc(...entity.Pos, 3, 0, 2* Math.PI);
            Renderer.Ctx.fill();
        }

        Renderer.Ctx.save();
        Renderer.Ctx.shadowColor = 'black';
        Renderer.Ctx.shadowOffsetX = Renderer.Ctx.shadowOffsetY = 1;

        Renderer.Ctx.font = DEBUG_FONT;
        Renderer.Ctx.fillStyle = 'white';
        Renderer.Ctx.fillText(`${this.Fps} fps (last frame time: ${(this.FrameTimes.getLast() ?? 0).toFixed(2)})`, 10, this.textHeight);

        Renderer.Ctx.fillText("Stage: " + (this._game.State?.Name || "None"), 10, this.textHeight * 2);

        Renderer.Ctx.fillText("Keys: " + InputManager.S.Keys().join(', '), 10, this.textHeight * 3);

        const mouse = InputManager.S.MousePos();
        Renderer.Ctx.fillText(`Mouse: ${mouse[0]},${mouse[1]} (${(mouse[0] / 25).toFixed(2)},${(mouse[1] / 25).toFixed(2)}) ` + InputManager.S.MouseButtons().join(', ') + ' ' + (InputManager.S.MouseInCanvas ? 'Inside' : 'Outside'), 10, this.textHeight * 4);

        let i = 0;
        for (const text of this.ExtraDebugText.values()) {
            for (const line of text()) {
                Renderer.Ctx.fillText(line, 10, this.textHeight * (5 + i++));
            }
        }

        Renderer.Ctx.restore();

        let x = 400;
        Renderer.Ctx.fillStyle = 'grey';
        for (let i = 0; i < MAX_DEBUG_FRAME_TIMES; i++) {
            const frame = (this.ElapsedTimes.get(i) ?? 0);
            Renderer.Ctx.fillRect(x, 10, 2, frame * 3);
            x += 3;
        } 
        
        x = 400;
        for (let i = 0; i < MAX_DEBUG_FRAME_TIMES; i++) {
            const frame = (this.FrameTimes.get(i) ?? 0);
            Renderer.Ctx.fillStyle = frame >= 16 ? (frame >= 33 ? 'red' : 'orange') : 'green';
            Renderer.Ctx.fillRect(x, 10, 2, frame * 3);
            x += 3;
        }
        
        Renderer.Ctx.strokeStyle = 'white';
        Renderer.Ctx.moveTo(400, 10);
        Renderer.Ctx.lineTo(400 + MAX_DEBUG_FRAME_TIMES * 3, 10);
        Renderer.Ctx.stroke();

        Renderer.Ctx.strokeStyle = 'orange';
        Renderer.Ctx.beginPath();
        Renderer.Ctx.moveTo(400, 58);
        Renderer.Ctx.lineTo(400 + MAX_DEBUG_FRAME_TIMES * 3, 58);
        Renderer.Ctx.stroke();
        Renderer.Ctx.fillStyle = 'orange';
        Renderer.Ctx.fillText('60fps', 400, 58);

        Renderer.Ctx.strokeStyle = 'red';
        Renderer.Ctx.beginPath();
        Renderer.Ctx.moveTo(400, 110);
        Renderer.Ctx.lineTo(400 + MAX_DEBUG_FRAME_TIMES * 3, 110);
        Renderer.Ctx.stroke();
        Renderer.Ctx.fillStyle = 'red';
        Renderer.Ctx.fillText('30fps', 400, 110);
        

        for (const draw of this.ExtraDebugDraw.values())
            draw();
    }
    
    Update(elapsedTime: number): void {
        this.ElapsedTimes.add(elapsedTime * 1000);
        this.elapsedTime += elapsedTime;

        if (this.elapsedTime >= 1) {
            this.Fps = Math.round((this.totalFrames / this.elapsedTime) * 100) / 100;
            this.totalFrames = 0;
            this.elapsedTime = 0;
        }

        if (InputManager.S.KeyWentDown('F3')) {
            this.Enabled = false;
        }
    }

    public override DisabledUpdate(elapsedTime: number): void {
        if (InputManager.S.KeyWentDown('F3')) {
            this.Enabled = true;
        }
    }

    public AddExtraDebugDraw(thing: IDebugDrawable): void {
        this.ExtraDebugDraw.set(thing, () => thing.DebugDraw());
        thing.OnRemoved(removed => this.ExtraDebugDraw.delete(removed))
    }

    public AddExtraDebugDrawQuick(thing: IRemoveable, draw: () => void): void {
        this.ExtraDebugDraw.set(thing, draw);
        thing.OnRemoved(removed => this.ExtraDebugDraw.delete(removed))
    }

    public AddExtraDebugTextQuick(thing: IRemoveable, text: () => string[]): void {
        this.ExtraDebugText.set(thing, text);
        thing.OnRemoved(removed => this.ExtraDebugText.delete(removed))
    }
}