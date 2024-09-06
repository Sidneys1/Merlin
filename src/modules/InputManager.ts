import { IGame, MouseDetails } from "../Interfaces.js";
import { GameModule } from "../GameModule.js";
import { Point, MouseButton } from "../Types.js";
import { Renderer } from "../Renderer.js";

export class InputManager extends GameModule {
    public Alt: boolean = false;
    public Shift: boolean = false;
    public Ctrl: boolean = false;

    private constructor() {
        super(true, 9999);
        
        window.addEventListener("keydown", ev => {
            this.Alt = ev.altKey;
            this.Shift = ev.shiftKey;
            this.Ctrl = ev.ctrlKey;
            this.transientKeyMap.set(ev.code, true);
            ev.preventDefault();
        });
        window.addEventListener("keyup", ev => {
            this.Alt = ev.altKey;
            this.Shift = ev.shiftKey;
            this.Ctrl = ev.ctrlKey;

            this.transientKeyMap.set(ev.code, false);
            ev.preventDefault();
        });

        const canvas = Renderer.Canvas;

        const pos = canvas.getBoundingClientRect();
        canvas.addEventListener("mousemove", ev => {
            const mouseX = Math.floor(ev.clientX - pos.left);
            const mouseY = Math.floor(ev.clientY - pos.top);
            if (mouseX < 0 || mouseY < 0) return;

            this.transientMouse.X = mouseX;
            this.transientMouse.Y = mouseY;
        });

        canvas.addEventListener("mousedown", ev => {
            this.transientMouse.buttons[ev.button] = true;
            ev.preventDefault();
        });
        canvas.addEventListener("mouseup", ev => {
            this.transientMouse.buttons[ev.button] = false;
            ev.preventDefault();
        });
    }

    private static _singleton: InputManager;
    public static get S(): InputManager {
        return this._singleton || (this._singleton = new this());
    }

    private lastKeyMap = new Map<string, boolean>();
    private thisKeyMap = new Map<string, boolean>();
    private transientKeyMap = new Map<string, boolean>();

    private lastMouse: MouseDetails = {X: 0, Y: 0, buttons: [false, false, false]};
    private thisMouse: MouseDetails = {X: 0, Y: 0, buttons: [false, false, false]};
    private transientMouse: MouseDetails = {X: 0, Y: 0, buttons: [false, false, false]};

    public Update() {
        this.lastKeyMap = new Map(this.thisKeyMap);
        this.thisKeyMap = new Map(this.transientKeyMap);

        this.lastMouse.X = this.thisMouse.X;
        this.lastMouse.Y = this.thisMouse.Y;
        this.lastMouse.buttons = [...this.thisMouse.buttons];
        
        this.thisMouse.X = this.transientMouse.X;
        this.thisMouse.Y = this.transientMouse.Y;
        this.thisMouse.buttons = [...this.transientMouse.buttons];
    }

    public Keys(): string[] {
        return Array.from(this.thisKeyMap.entries()).filter(([k, v]) => v).map(o => o[0]);
    }

    public KeyDown(key: string): boolean {
        return this.thisKeyMap.get(key) || false;
    }

    public KeyUp(key: string): boolean {
        return this.thisKeyMap.has(key) && !this.thisKeyMap.get(key);
    }

    public KeyWentDown(key: string): boolean {
        return this.thisKeyMap.get(key) && !this.lastKeyMap.get(key) || false;
    }

    public KeyWentUp(key: string): boolean {
        return !this.thisKeyMap.get(key) && this.lastKeyMap.get(key) || false;
    }

    public MouseButtons(): MouseButton[] {
        var ret: MouseButton[] = [];
        if (this.thisMouse.buttons[0]) ret.push(MouseButton.Left);
        if (this.thisMouse.buttons[1]) ret.push(MouseButton.Middle);
        if (this.thisMouse.buttons[2]) ret.push(MouseButton.Right);
        return ret;
    }

    MousePos(): Point {
        return [this.thisMouse.X, this.thisMouse.Y];
    }

    MouseWentDown(button: MouseButton): boolean {
        return this.thisMouse.buttons[button] && !this.lastMouse.buttons[button];
    }

    MouseUp(button: MouseButton): boolean {
        return !this.thisMouse.buttons[button] && this.lastMouse.buttons[button];
    }

    MouseButton(button: MouseButton) {
        return this.thisMouse.buttons[button];
    }
}