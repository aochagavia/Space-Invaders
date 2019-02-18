import {Entity} from "./Entity";
import DisplayObject = PIXI.DisplayObject;

export abstract class AnimatedEntity extends Entity {
    private started = false;

    constructor() {
        super();

        this.on("added", this.onAdded);
        this.on("removed", this.onRemoved);
    }

    public start(): void {
        this.started = true;
        this.children
            .filter(c => c instanceof AnimatedEntity)
            .forEach(ae => (ae as AnimatedEntity).start());
    }

    public stop(): void {
        this.started = false;
        this.children
            .filter(c => c instanceof AnimatedEntity)
            .forEach(ae => (ae as AnimatedEntity).stop());
    }

    protected isStarted(): boolean {
        return this.started;
    }

    private onAdded(parent: DisplayObject): void {
        PIXI.ticker.shared.add(this.tickInteral, this);
    }

    private onRemoved(parent: DisplayObject): void {
        PIXI.ticker.shared.remove(this.tickInteral, this);
    }

    private tickInteral(): void {
        if (!this.started) {
            return;
        }

        this.tick(PIXI.ticker.shared.elapsedMS);
    }
    protected tick(elapsed: number): void {}
}