import { IGame, IRemoveable } from '../Interfaces.js'
import { DrawableGameModule } from "../GameModule.js";
import { DEBUG_FONT } from '../Constants.js';
import { Renderer } from '../Renderer.js';
import { InputManager } from './InputManager.js';

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
    
    public static S?: DebugModule;

    constructor(game: IGame) {
        super(true, -9999, -9999);

        this._game = game;

        this.textHeight = 10 + Renderer.MeasureText(DEBUG_FONT, "0").actualBoundingBoxAscent;

        DebugModule.S = this;
    }

    Draw(_: number): void {
        this.totalFrames++;

        // const ctx = Renderer.Ctx;
        for (const entity of this._game.State?.Entities ?? []) {
            Renderer.FillCircle('red', entity.Pos[0], entity.Pos[1], 3);
        }

        Renderer.Ctx.save();
        Renderer.Ctx.shadowColor = 'black';
        Renderer.Ctx.shadowOffsetX = Renderer.Ctx.shadowOffsetY = 1;

        Renderer.DrawText("white", DEBUG_FONT, 10, this.textHeight, `${this.Fps} fps`);

        Renderer.DrawText("white", DEBUG_FONT, 10, this.textHeight * 2, "Stage: " + (this._game.State?.Name || "None"));

        Renderer.DrawText("white", DEBUG_FONT, 10, this.textHeight * 3, "Keys: " + InputManager.S.Keys().join(', '));

        const mouse = InputManager.S.MousePos();
        Renderer.DrawText("white", DEBUG_FONT, 10, this.textHeight * 4, `Mouse: ${mouse[0]},${mouse[1]} (${(mouse[0] / 25).toFixed(2)},${(mouse[1] / 25).toFixed(2)}) ` + InputManager.S.MouseButtons().join(', ') + ' ' + (InputManager.S.MouseInCanvas ? 'Inside' : 'Outside'));

        let i = 0;
        for (const text of this.ExtraDebugText.values()) {
            for (const line of text()) {
                Renderer.DrawText("white", DEBUG_FONT, 10, this.textHeight * (5 + i++), line);
            }
        }

        Renderer.Ctx.restore();

        for (const draw of this.ExtraDebugDraw.values())
            draw();
    }
    
    Update(elapsedTime: number): void {
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