import {ShieldsInfoInterface} from "../../Controller/ShieldsInfoInterface";
import {Entity} from "../Entity";
import {Options} from "../../Options";
import {Shield} from "./Shield";

export class Shields extends Entity implements ShieldsInfoInterface {
    constructor(options: Options) {
        super();
        for (let i = 0; i < 4; i++) {
            let shield = new Shield(options);
            shield.x = i * 120;
            this.addChild(shield);
        }
    }

    testHit(other: Entity): boolean {
        let hit = false;
        this.children.forEach(c => {
            hit = (c as Entity).testHit(other) || hit;
        });
        return hit;
    }
}