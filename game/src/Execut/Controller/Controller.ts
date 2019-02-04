import {Options} from "../Options";
import {ShipInterface} from "./ShipInterface";
import {AliensInfoInterface} from "./AliensInfoInterface";
import {ShieldsInfoInterface} from "./ShieldsInfoInterface";
import {BulletsInfoInterface} from "./BulletsInfoInterface";
import {ShipState} from "./ShipState";
import EventEmitter = PIXI.utils.EventEmitter;

export class Controller extends EventEmitter {
    private started = false;

    private readonly options: Options;
    private readonly ship: ShipInterface;
    private readonly aliens: AliensInfoInterface;
    private readonly shields: ShieldsInfoInterface;
    private readonly bullets: BulletsInfoInterface;

    private readonly shipState: ShipState = new ShipState();

    constructor(options: Options, ship: ShipInterface, aliens: AliensInfoInterface, shields: ShieldsInfoInterface, bullets: BulletsInfoInterface) {
        super();

        this.options = options;

        this.ship = ship;
        this.aliens = aliens;
        this.shields = shields;
        this.bullets = bullets;
    }

    public start(): void {
        this.started = true;
        this.shipState.lastFire = Date.now();
        PIXI.ticker.shared.add(this.tick, this);
    }

    public stop(): void {
        this.started = false;
        PIXI.ticker.shared.remove(this.tick, this);
    }

    protected isStarted(): boolean {
        return this.started;
    }

    private tick(): void {
        if (!this.started) {
            return;
        }

        this.updateShip(PIXI.ticker.shared.elapsedMS);
    }

    public gameOver(): void {
        this.stop();
    }

    private updateShip(elapsed: number): void {
        let move = elapsed / 100 * this.options.shipSpeed * this.shipState.direction;

        let pos = this.ship.getPosition() + move;

        let minPos = 25;
        let maxPos = 480 - 25;

        if (pos > maxPos) {
            pos = maxPos - (pos - maxPos);
            this.shipState.direction = -this.shipState.direction;
        }

        if (pos < minPos) {
            pos = minPos + (minPos - pos);
            this.shipState.direction = -this.shipState.direction;
        }

        this.ship.moveToPosition(pos);

        if (this.isTimeToShoot()) {
            this.emit("fire", this.ship.getPosition(), this.options.shipBulletSpeed);
        }
    }

    private isTimeToShoot(): boolean {
        let elapsed = Date.now() - this.shipState.lastFire;

        if (elapsed >= this.options.shipFireInterval) {
            this.shipState.lastFire = Date.now() - (elapsed - this.options.shipFireInterval);
            return true;
        }

        return false;
    }
}