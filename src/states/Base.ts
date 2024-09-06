import { IDrawable, IGameCommon, IUpdatable } from "../Interfaces.js";
import { Entity } from "../entities/Base.js";
import { GameCommon } from "../GameCommon.js";


export abstract class GameState extends GameCommon implements IGameCommon, IUpdatable, IDrawable {
    public abstract Name: string;
    DrawPriority: number = 0;
    Enabled: boolean = true;
    Priority: number = 0;
    Layer: number = 0;

    public Entities: Entity[] = [];

    public RemoveEntity(entity: Entity): void {
        this.Drawables = this.Drawables.filter(e => e !== entity);
        this.Updatables = this.Updatables.filter(e => e !== entity);
        this.Entities = this.Entities.filter(e => e !== entity);
    }

    public AddEntity(entity: Entity): void {
        this.Entities.push(entity);
        this.Updatables.push(entity);
        this.Drawables.push(entity);
    }

    constructor() { super(); }
    DisabledUpdate(elapsedTime: number): void { }

    public Update(elapsedTime: number) {
        for (const updatable of this.Updatables)
            updatable.Enabled ? updatable.Update(elapsedTime) : updatable.DisabledUpdate(elapsedTime);
    }

    public Draw(elapsedTime: number) {
        let maxlayer = 0;
        for (let layer = 0; layer <= maxlayer; layer++) {
            // console.debug(`Drawing layer ${layer}`);
            for (const drawable of this.Drawables) {
                if (!drawable.Enabled) continue;
                if (drawable.Layer > maxlayer) maxlayer = drawable.Layer;
                if (drawable.Layer === layer)
                    drawable.Draw(elapsedTime);
            }
        }
    }
}
