import {Options} from "./Options";
import {Background} from "./Background";
import {AlienField} from "./Entity/Alien/AlienField";
import {BulletPool} from "./Entity/Bullet/BulletPool";
import {Controller} from "./Controller/Controller";
import {Shields} from "./Entity/Shield/Shields";
import {Ship} from "./Entity/Ship/Ship";
import {AnimatedEntity} from "./Entity/AnimatedEntity";

export class Game extends AnimatedEntity {
    private readonly options: Options;

    private alienField: AlienField;
    private shields: Shields;
    private bulletPool: BulletPool;
    private ship: Ship;

    private controller: Controller;

    constructor(options: Options) {
        super();
        this.options = options;

        this.addChild(new Background());
    }

    public preloadFinished():void {
        // There is no way to await a resource texture, so if we for example create a sprite before the resource is
        // loaded, the texture will be undefined and thus invisible. Therefore we start building our display list
        // on .preloadFinished(), which is called after the resource loader has finished loading.
        // TODO: There is probably a better way of doing this

        this.alienField = new AlienField(this.options);
        this.alienField.on("fire", this.onAlienFire.bind(this));
        this.addChild(this.alienField);

        this.shields = new Shields(this.options);
        this.shields.y = 800;
        this.addChild(this.shields);

        this.bulletPool = new BulletPool();
        this.addChild(this.bulletPool);

        this.ship = new Ship(this.options);
        this.ship.y = 1080 - 50;
        this.ship.on("playerDeath",  this.onPlayerDeath.bind(this));
        this.addChild(this.ship);


        this.controller = new Controller(
            this.options,
            this.ship,
            this.alienField,
            this.shields,
            this.bulletPool
        );

        this.controller.on("fire", this.onPlayerFire.bind(this));
    }

    public start(): void {
        this.alienField.start();
        this.bulletPool.start();

        this.controller.start();

        super.start();
    }

    protected tick(elapsed: number): void {
        this.bulletPool.testHit(this.alienField);
        this.bulletPool.testHit(this.shields);
        this.bulletPool.testHit(this.ship);

        if (this.alienField.getRemainingAliens().length == 0) {
            this.win();
        }
    }

    private onPlayerFire(x: number, speed: number): void {
        let bullet = this.bulletPool.getPlayerBullet();
        bullet.setSpeed(-speed); // bullets from player go up
        bullet.x = x;
        bullet.y = 1080 - 50;
    }

    private onAlienFire(x: number, y: number): void {
        let bullet = this.bulletPool.getAlienBullet();
        bullet.setSpeed(10);
        bullet.x = x;
        bullet.y = y;
    }

    private onPlayerDeath(): void {
        this.lose();
    }

    private win(): void {
        console.log("Player wins!");
        this.controller.gameOver()
    }

    private lose(): void {
        console.log("Player loses :(");
        this.controller.gameOver()
    }

}