import {Entity} from "../Entity";
import Graphics = PIXI.Graphics;
import {Bullet} from "../Bullet/Bullet";
import {Alien} from "../Alien/Alien";
import {Util} from "../../Util";
import {Options} from "../../Options";

export class Shield extends Entity {
    private _isAlive = true;

    private readonly blocks: Graphics[] = [];

    constructor(options: Options) {
        super();

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 6; j++) {
                let block = new Graphics();
                block.beginFill(Util.colorFromRgb(192 + Math.random() * 64, 192 + Math.random() * 64, 192 + Math.random() * 64));
                block.drawRect(0, 0, 10, 10);
                block.x = 30 + j * 10;
                block.y = i * 10;
                this.addChild(block);
                this.blocks.push(block);
            }
        }
    }

    testHit(other: Entity): boolean {
        if (!this._isAlive) {
            return false;
        }

        let blocks = this.blocks.filter((b) => b.visible);

        if (other instanceof Bullet) {
            if ((other as Bullet).isRecycled()) {
                return false;
            }
            if ((other as Bullet).getSpeed() < 0) {
                // test hit from below, check from below
                blocks = blocks.reverse();
            }
        }


        if (other instanceof Alien) {
            //
        }

        for (let i = 0; i < blocks.length; i++) {
            let block = blocks[i];
            if (Util.containersIntersect(block, other)) {
                block.visible = false;
                if (other instanceof Bullet) {
                    (other as Bullet).recycle();
                }
                return true;
            }
        }

        return false;
    }
}