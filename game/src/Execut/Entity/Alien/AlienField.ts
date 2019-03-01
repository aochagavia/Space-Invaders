import {AnimatedEntity} from "../AnimatedEntity";
import {Random} from "../../Random";
import {AlienRow} from "./AlienRow";
import {Alien} from "./Alien";
import {Options} from "../../Options";
import {Entity} from "../Entity";
import {AliensInfoInterface} from "../../Controller/AliensInfoInterface";
import * as _ from "underscore";

export class AlienField extends AnimatedEntity implements AliensInfoInterface {
    private readonly rows: Array<AlienRow> = [];
    private readonly random = new Random("field");
    private lastFire: number;

    private readonly fireInterval = 1500;

    private readonly alienColors = [
        0xff6633,
        0xff33cc,
        0x00ffff,
        0xcc0000,
        0x9900ff,
        0xffffff,
        0xffff00,
        0x66ff33,
    ];

    private readonly alienTypes = [0, 1, 2, 3, 4, 5, 6];

    constructor(options: Options) {
        super();

        let alienTypes = _.shuffle(this.alienTypes) as number[];
        let alienColors = _.shuffle(this.alienColors) as number[];

        for (let i = 0; i < 7; i++) {

            let alienType = alienTypes[i];

            let color = alienColors[i];
            let r = (color >> 16 & 0xff) / 255;
            let g = (color >> 8 & 0xff) / 255;
            let b = (color & 0xff) / 255;

            let row = new AlienRow(i, alienType, r,g,b);
            row.x = 0;// i * 10;
            row.y = i * 60;
            row.on("alienDeath", this.onAlienDeath.bind(this));
            this.addChild(row);
            this.rows.push(row);
        }
    }

    public start(): void {
        super.start();
        this.lastFire = Date.now();
    }


    private onAlienDeath(alien: Alien): void {
        // Bubble alienDeath event
        this.emit("alienDeath", alien);

        if (this.getRemainingAliens().length == 0) {
            this.emit("fieldDeath", this);
        }
    }

    public getRemainingAliens(): Array<Alien> {
        return this.rows.reduce((pv, cv) => pv.concat(cv.getRemainingAliens()), new Array<Alien>());
    }

    protected tick(elapsed: number): void {
        if (this.timeForANewBullet()) {
            this.y ++; // experimental: move slowly down
            this.fire();
        }
    }

    private timeForANewBullet(): boolean {
        if (this.getRemainingAliens().length == 0) {
            return false;
        }

        let elapsed = Date.now() - this.lastFire;

        if (elapsed >= this.fireInterval) {
            this.lastFire = Date.now() - (elapsed - this.fireInterval);
            return true;
        }

        return false;
    }

    private fire() {
        let pos = Math.floor(this.random.next() * 7);

        for (let r = this.rows.length - 1; r >= 0; r--) {
            let row = this.rows[r];
            if (row.getAllAliens()[pos].getIsAlive()) {
                this.emit("fire", row.x + 30 + pos * 60, this.y + row.y + 60);
                break;
            }
        }
    }

    public testHit(other: Entity): boolean {
        let hit = false;
        this.rows.forEach(entity => hit = entity.testHit(other) || hit);
        return hit;
    }
}