import {Entity} from "../Entity";

export abstract class Bullet extends Entity {
    private used = false;
    private speed = 0;

    public reset(): void {
        this.x = 0; // reset position so it won't be immediately recycled again because it is out of bounds
        this.y = 0; // todo: find a better way
        this.updateTransform(); // force transform cache update

        this.used = false;
        this.visible = true;
    }

    public isRecycled(): boolean {
        return this.used;
    }

    public recycle(): void {
        this.used = true;
        this.visible = false;
    }

    public setSpeed(speed: number): void {
        this.speed = speed;
    }

    public getSpeed(): number {
        return this.speed;
    }
}