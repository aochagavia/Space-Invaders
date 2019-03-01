import {AnimatedEntity} from "../AnimatedEntity";
import {Alien} from "./Alien";
import {Entity} from "../Entity";
import * as _ from "underscore";

export class AlienRow extends AnimatedEntity {
    private readonly speed: number; // px per 100ms
    private direction: number = 1;

    private readonly aliens: Array<Alien> = [];



    constructor(row: number, alienType: number = 0, r: number = 1, g: number = 1, b: number = 1) {
        super();

        this.speed = 1 + row / 5;

        for (let i = 0; i < 7; i++) {
            let alien = new Alien(alienType, r, g, b);
            alien.x = i * 60;

            alien.on("alienDeath", ((a: Alien) => {
                // Bubble alienDeath event
                this.emit("alienDeath", a);
            }).bind(this));

            this.addChild(alien);
            this.aliens.push(alien);
        }
    }

    protected tick(elapsed: number): void {
        let movement = elapsed / 100 * this.speed;

        this.x += this.direction * movement;

        if (this.x > 60) {
            this.x = 60 - (this.x - 60);
            this.direction = -this.direction;
        }

        if (this.x < 0) {
            this.x = -this.x;
            this.direction = -this.direction;
        }
    }

    public testHit(other: Entity): boolean {
        let hit = false;
        this.aliens.forEach(a => hit = a.testHit(other) || hit);
        return hit;
    }

    public getAllAliens(): Array<Alien> {
        return this.aliens;
    }

    public getRemainingAliens(): Array<Alien> {
        return this.aliens.filter(entity => entity.getIsAlive());
    }
}