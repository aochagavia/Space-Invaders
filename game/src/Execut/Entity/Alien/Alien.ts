import {Entity} from "../Entity";
import Sprite = PIXI.Sprite;
import {Explosion} from "../../Explosion";
import {Bullet} from "../Bullet/Bullet";
import {PlayerBullet} from "../Bullet/PlayerBullet";
import ColorMatrixFilter = PIXI.filters.ColorMatrixFilter;

export class Alien extends Entity {
    private readonly sprite: Sprite;
    private readonly explosion: Explosion;

    private isAlive = true;

    private readonly sprites = [
        './assets/game/images/alien01.png',
        './assets/game/images/alien02.png',
        './assets/game/images/alien03.png',
        './assets/game/images/alien04.png',
        './assets/game/images/alien05.png',
        './assets/game/images/alien06.png',
        './assets/game/images/alien07.png',
    ];

    constructor(spriteId: number = 0, r: number = 1, g: number = 1, b: number = 1) {
        super();

        let colorFilter = new ColorMatrixFilter();
        colorFilter.matrix = [r, 0, 0, 0, 0, 0, g, 0, 0, 0, 0, 0, b, 0, 0, 0, 0, 0, 1, 0];

        this.sprite = new Sprite(PIXI.loader.resources[this.sprites[spriteId]].texture);
        this.sprite.x = 30 - this.sprite.width / 2;
        this.sprite.y = 30 - this.sprite.height / 2;

        this.sprite.filters = [colorFilter];
        this.addChild(this.sprite);

        this.explosion = new Explosion();
        this.explosion.x = 7.5;
        this.explosion.y = 7.5;
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