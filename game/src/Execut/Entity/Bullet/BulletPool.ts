import {AnimatedEntity} from "../AnimatedEntity";
import {Bullet} from "./Bullet";
import {Entity} from "../Entity";
import {PlayerBullet} from "./PlayerBullet";
import {AlienBullet} from "./AlienBullet";
import {Util} from "../../Util";
import {BulletsInfoInterface} from "../../Controller/BulletsInfoInterface";
import Graphics = PIXI.Graphics;

export class BulletPool extends AnimatedEntity implements BulletsInfoInterface {
    private readonly bullets: Array<Bullet> = [];

    public constructor() {
        super();

        this.mask = new Graphics();
        this.mask.drawRect(0, 0, 480, 1000);
        this.addChild(this.mask);
    }

    public testHit(other: Entity): boolean {
        // Be recycle the target implementation of testHit, because here we loop through our bullets,
        // and the alienField loops trough the aliens it has.
        // If we would recycle the bullet.testHit, we would actually compare the bullet to the bounding
        // rect of the alien field.
        // todo: a better, more intuitive way of doing this

        let hit = false;
        this.bullets
            .filter(b => !b.isRecycled())
            .forEach(b => hit = other.testHit(b) || hit);
        return hit;
    }

    // todo: can we leverage generics here?
    public getPlayerBullet(): PlayerBullet {
        let bullet = this.bullets
            .filter(b => b.isRecycled())
            .find(b => b instanceof PlayerBullet) as PlayerBullet;

        if (bullet == null) {
            bullet = new PlayerBullet();
            this.addChild(bullet);
            this.bullets.push(bullet);
        }

        bullet.reset();
        return bullet;
    }

    public getAlienBullet(): AlienBullet {
        let bullet = this.bullets
            .filter(b => b.isRecycled())
            .find(b => b instanceof AlienBullet) as AlienBullet;

        if (bullet == null) {
            bullet = new AlienBullet();
            this.addChild(bullet);
            this.bullets.push(bullet);
        }

        bullet.reset();
        return bullet;
    }

    protected tick(elapsed: number): void {
        let movementFactor = elapsed / 100;

        this.bullets
            .filter(b => !b.isRecycled())
            .forEach(b => {
                b.y += movementFactor * b.getSpeed();
                let rect = b.getBounds(true);
                if (
                    (b.getSpeed() < 0 && rect.bottom < 0) ||
                    (b.getSpeed() > 0 && rect.top > 1080)) {
                    b.recycle();
                }
            });
    }


}