import { AssetManager } from "./modules/AssetManager.js";
import { GameState } from "./states/Base.js";
import { InputManager } from "./modules/InputManager.js";
import { Renderer } from "./Renderer.js";
import { GameModule } from "./GameModule.js";
import { Rectangle } from "./Types.js";

export interface IGameCommon {
    AddModule(module: GameModule): void;
}

export interface IGame extends IGameCommon {
    // InputManager: InputManager;
    // AssetManager: AssetManager;
    State?: GameState;
    SetState(state: GameState): void;
}

export interface IUpdatable {
    Enabled: boolean;
    Priority: number;
    Update(elapsedTime: number): void;
    DisabledUpdate(elapsedTime: number): void;
}

export interface IDrawable {
    Enabled: boolean;
    DrawPriority: number;
    Layer: number;
    Draw(elapsedTime: number): void;
}

export interface MouseDetails {
    mouseInCanvas: boolean;
    X: number;
    Y: number;
    buttons: [boolean, boolean, boolean];
}

export interface IRemoveable {
    OnRemoved(callback: (removed: IRemoveable) => void): void;
};