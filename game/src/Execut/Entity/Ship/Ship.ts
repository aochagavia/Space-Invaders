import {AnimatedEntity} from "../AnimatedEntity";
import {Options} from "../../Options";
import {ShipInterface} from "../../Controller/ShipInterface";
import Sprite = PIXI.Sprite;
import {Explosion} from "../../Explosion";
import {Entity} from "../Entity";
import {AlienBullet} from "../Bullet/AlienBullet";
import {Bullet} from "../Bullet/Bullet";
import { Random } from "../../Random";

export class Ship extends AnimatedEntity implements ShipInterface {
    private readonly options: Options;
    private readonly sprite: Sprite;
    private readonly explosion: Explosion;

    private readonly random = new Random('ship');

    constructor(options: Options) {
        super();
        this.options = options;

        this.x = 25;

        this.sprite = new Sprite(PIXI.loader.resources[`./images/0001.png`].texture);
        this.sprite.x = -25;
        this.addChild(this.sprite);

        this.explosion = new Explosion();
        this.explosion.x = -25;
        this.addChild(this.explosion);
    }

    protected tick(elapsed: number): void {

    }

    public moveToPosition(x: number): void {
        this.x = Math.max(25, Math.min(480 - 25, x));
    }

    public getPosition(): number {
        return this.x;
    }

    public testHit(other: Entity): boolean {
        if (!(other instanceof AlienBullet)) {
            return false;
        }

        if ((other as Bullet).isRecycled()) {
            return false;
        }

        if (!super.testHit(other)) {
            return false;
        }

        (other as Bullet).recycle();

        if (this.random.next() < this.options.shipDodgeChance) {
            this.emit("dodge");
            return false;
        }

        this.sprite.visible = false;
        this.explosion.boom();
        this.emit("playerDeath");

        return true;
    }
}