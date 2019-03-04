import {Bullet} from "./Bullet";
import Sprite = PIXI.Sprite;

export class PlayerBullet extends Bullet {
    private readonly sprite: Sprite;

    constructor() {
        super();
        this.sprite = new Sprite(PIXI.loader.resources["./assets/game/images/bullet.png"].texture);
        this.sprite.x = -5;
        this.sprite.y = -30;
        this.addChild(this.sprite);
    }
}