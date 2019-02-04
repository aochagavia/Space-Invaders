import Container = PIXI.Container;
import {Util} from "../Util";

export abstract class Entity extends Container {
    constructor() {
        super();
    }

    public testHit(other: Entity): boolean {
        return Util.containersIntersect(this, other);
    }
}