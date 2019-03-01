import {Entity} from "../Entity";
import Graphics = PIXI.Graphics;
import {Bullet} from "../Bullet/Bullet";
import {Alien} from "../Alien/Alien";
import {Util} from "../../Util";
import {Options} from "../../Options";
import {AlienBullet} from "../Bullet/AlienBullet";
import {PlayerBullet} from "../Bullet/PlayerBullet";

export class Shield extends Entity {
    private _isAlive = true;

    private readonly blocks: Graphics[] = [];

    constructor(options: Options) {
        super();

        let i = 0;
        for (let j = 2; j < 10-2; j++) {
            this.addBlock(i, j);
        }

        i = 1;
        for (let j = 1; j < 10 - 1; j++) {
            this.addBlock(i, j);
        }

        let end = 2 + options.shieldThickness;
        for (i = 2; i < end; i++) {
            for (let j = 0; j < 10; j++) {
                this.addBlock(i, j);
            }
        }

        end = i + 2;
        for (i; i < end; i++) {
            for (let j = 0; j < 3; j++) {
                this.addBlock(i, j);
                this.addBlock(i, j + 7);
            }
        }

        end = i + 1;
        for (i; i < end; i++) {
            for (let j = 0; j < 2; j++) {
                this.addBlock(i, j);
                this.addBlock(i, j + 8);
            }
        }

    }

    private addBlock(i: number, j: number): void {
        let block = new Graphics();
        block.beginFill(0x66ff33);
        block.drawRect(0, 0, 4, 4);
        block.x = 35 + j * 5;
        block.y = i * 5;
        this.addChild(block);
        this.blocks.push(block);
    }

    testHit(other: Entity): boolean {
        if (!this._isAlive) {
            return false;
        }

        // disable player bullets hitting shields
        if (other instanceof PlayerBullet) {
            return false;
        }

        let blocks = this.blocks.filter((b) => b.visible);

        if (other instanceof AlienBullet) {
            if ((other as Bullet).isRecycled()) {
                return false;
            }
            if ((other as Bullet).getSpeed() < 0) {
                // test hit from below, check from below
                // (only happens for player bullets)
                blocks = blocks.reverse();
            }
        }

        if (other instanceof Alien) {
            // todo: make aliens destroy shields too?
        }

        return blocks.reduce((pv, block) => {
            if (Util.containersIntersect(block, other)) {
                block.visible = false;
                if (other instanceof Bullet) {
                    (other as Bullet).recycle();
                }
                return true;
            }
            return pv;
        }, false);


    }
}