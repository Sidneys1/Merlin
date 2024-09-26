import { Entity } from "./Base.js";
import { BUTTON_FONT } from "../Constants.js";
import { Point, MouseButton } from "../Types.js";
import { Renderer } from "../Renderer.js";
import { InputManager } from "../modules/InputManager.js";

type ButtonStyle = {
    Background: string|CanvasGradient|null;
    Border: string|CanvasGradient|null;
    TextColor: string|CanvasGradient;
};

export class Button extends Entity {
    private _font = BUTTON_FONT;
    public get Font() {
        return this._font;
    }
    public set Font(value) {
        this._font = value;
        this.textMetrics = Renderer.MeasureText(this._font, this.text)
    }

    public Style: ButtonStyle = {
        Background: 'white',
        Border: '1px black',
        TextColor: 'black',
    };
    public HoverStyle: ButtonStyle = {
        Background: '#aaa',
        Border: '1px black',
        TextColor: 'black',
    };
    public ClickStyle: ButtonStyle = {
        Background: '#ddd',
        Border: '1px grey',
        TextColor: 'grey',
    };

    private text: string;
    private textMetrics: TextMetrics;
    private halfHeight: number;
    private halfWidth: number;

    private hovered = false;
    private clicked = false;
    private clickCallback?: () => void;

    constructor(text: string, pos: Point, size: Point, clickCallback?: (() => void)) {
        super(pos, size);

        this.halfWidth = size[0] / 2;
        this.halfHeight = size[1] / 2;

        this.text = text;

        this.textMetrics = Renderer.MeasureText(this.Font, this.text);
        this.clickCallback = clickCallback;
    }

    SetText(text: string) {
        this.text = text;

        this.textMetrics = Renderer.MeasureText(this.Font, this.text);
    }

    Draw(elapsedTime: number): void {
        const style = this.clicked ? this.ClickStyle : (this.hovered ? this.HoverStyle : this.Style);

        if (style.Background !== null) Renderer.FillRect(style.Background, ...this.Pos, ...this.Size);
        if (style.Border !== null) Renderer.DrawRect(style.Border, ...this.Pos, ...this.Size);

        const textX = this.Pos[0] + this.halfWidth - (this.textMetrics.width / 2);
        const textY = this.Pos[1] + this.halfHeight + (this.textMetrics.actualBoundingBoxAscent / 2);
        Renderer.DrawText(style.TextColor, this.Font, textX, textY, this.text, this.Size[0]);
    }

    Update(elapsedTime: number): void {
        if (!this.Enabled)
            return;

        const mouse = InputManager.S.MousePos();
        this.hovered = mouse[0] >= this.Pos[0]
            && mouse[0] < (this.Pos[0] + this.Size[0])
            && mouse[1] >= this.Pos[1]
            && mouse[1] < (this.Pos[1] + this.Size[1]);

        if (!this.hovered) {
            this.clicked = false;
            return;
        }

        const lastClicked = this.clicked;
        this.clicked = InputManager.S.MouseButton(MouseButton.Left);

        if (lastClicked && !this.clicked) {
            if (this.clickCallback !== undefined)
                this.clickCallback();
        }
    }
}
