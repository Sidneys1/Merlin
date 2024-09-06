import { IGame, IDrawable, IUpdatable } from "./Interfaces.js";

export abstract class GameModule implements IUpdatable {
    public Enabled: boolean;
    public Priority: number;
    
    constructor(enabled_by_default = true, priority = 0) {
        this.Enabled = enabled_by_default; 
        this.Priority = priority;
    }
    
    public abstract Update(elapsedTime: number): void;
    public DisabledUpdate(elapsedTime: number) { /* Do nothing by default. */ }
}

export abstract class DrawableGameModule extends GameModule implements IDrawable {
    DrawPriority: number;
    Layer: number = 0;

    constructor(enabled_by_default = true, priority = 0, draw_priority = 0) { 
        super(enabled_by_default, priority); 
        this.DrawPriority = draw_priority;
    }

    public abstract Draw(elapsedTime: number): void;
}
