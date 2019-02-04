import {Entity} from "../Entity";
import Sprite = PIXI.Sprite;
import {Explosion} from "../../Explosion";
import {Bullet} from "../Bullet/Bullet";
import {PlayerBullet} from "../Bullet/PlayerBullet";

export class Alien extends Entity {
    private readonly sprite: Sprite;
    private readonly explosion: Explosion;

    private isAlive = true;

    constructor() {
        super();
        this.sprite = new Sprite(PIXI.loader.resources["./images/alien.png"].texture);
        this.sprite.x = 5;
        this.sprite.y = 5;
        this.addChild(this.sprite);

        this.explosion = new Explosion();
        this.explosion.x = 5;
        this.explosion.y = 5;
        this.addChild(this.explosion);
    }

    public getIsAlive(): boolean {
        return this.isAlive;
    }

    public testHit(other: Entity): boolean {
        if (!this.isAlive) {
            return false;
        }

        if (!(other instanceof PlayerBullet)) {
            return false;
        }

        if ((other as Bullet).isRecycled()) {
            return false;
        }

        if (!super.testHit(other)) {
            return false;
        }

        // todo: could it have hit in the time between the last check with this bullet and now?

        (other as Bullet).recycle();
        this.die();

        return true;
    }

    private die(): void {
        this.isAlive = false;
        this.sprite.visible = false;
        this.explosion.boom();

        this.emit("alienDeath", this);
    }
}