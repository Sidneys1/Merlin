import { IDrawable, IGameCommon, IUpdatable } from "./Interfaces.js";
import { DrawableGameModule, GameModule } from "./GameModule.js";
import { Entity } from "./entities/Base.js";


export class GameCommon implements IGameCommon {
    Modules: GameModule[] = [];
    Drawables: IDrawable[] = [];
    Updatables: IUpdatable[] = [];

    constructor() {
        console.debug("Constructing base GameCommon.")
    }

    AddModule(module: GameModule): void {
        this.Modules.push(module);
        this.Modules.sort((a, b) => b.Priority - a.Priority);
        // console.debug("Modules:", this.Modules);

        this.Updatables.push(module);
        this.UpdateUpdateables();
        if (module instanceof DrawableGameModule) {
            this.Drawables.push(module);
            this.UpdateDrawables();
        }
    }

    UpdateDrawables() {
        // console.debug("Drawables:", this.Drawables);
        this.Drawables.sort((a, b) => b.DrawPriority - a.DrawPriority);
        // console.debug("Drawables:", this.Drawables);
    }
    UpdateUpdateables() {
        this.Updatables.sort((a, b) => b.Priority - a.Priority);
        // console.debug("Updatables:", this.Updatables);
    }
}
