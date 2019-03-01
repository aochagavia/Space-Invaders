import {AnimatedEntity} from "../AnimatedEntity";
import {Options} from "../../Options";
import {ShipInterface} from "../../Controller/ShipInterface";
import Sprite = PIXI.Sprite;
import {Explosion} from "../../Explosion";
import {Entity} from "../Entity";
import {AlienBullet} from "../Bullet/AlienBullet";
import {Bullet} from "../Bullet/Bullet";
import { Random } from "../../Random";
import ColorMatrixFilter = PIXI.filters.ColorMatrixFilter;

export class Ship extends AnimatedEntity implements ShipInterface {
    private readonly options: Options;
    private readonly sprite: Sprite;
    private readonly shield: Sprite;
    private readonly explosion: Explosion;

    private readonly random = new Random('ship');

    constructor(options: Options) {
        super();
        this.options = options;

        this.x = 30;

        let colorFilter = new ColorMatrixFilter();
        colorFilter.matrix = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0];
        this.filters = [colorFilter];

        this.sprite = new Sprite(PIXI.loader.resources[`./images/ship.png`].texture);
        this.sprite.x = -this.sprite.width / 2;
        this.addChild(this.sprite);

        this.shield = new Sprite(PIXI.loader.resources[`./images/ship_shield.png`].texture);
        this.shield.x = -this.shield.width / 2;
        this.shield.y = -10;
        this.shield.visible = this.options.shipShield;
        this.addChild(this.shield);

        this.explosion = new Explosion();
        this.explosion.x = -22.5;
        this.explosion.y = -10;
        this.addChild(this.explosion);
    }

    protected tick(elapsed: number): void {

    }

    public moveToPosition(x: number): void {
        this.x = Math.max(30, Math.min(480 - 30, x));
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

        if (this.shield.visible) {
            this.shield.visible = false;
            this.emit("shield");
            return false;
        }

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