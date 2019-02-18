import {Options} from "./Options";
import {Background} from "./Background";
import {AlienField} from "./Entity/Alien/AlienField";
import {BulletPool} from "./Entity/Bullet/BulletPool";
import {Controller} from "./Controller/Controller";
import {Shields} from "./Entity/Shield/Shields";
import {Ship} from "./Entity/Ship/Ship";
import {AnimatedEntity} from "./Entity/AnimatedEntity";
import {TextDisplay} from "./Text/TextDisplay";
import {SimpleText} from "./Text/SimpleText";
import {TextAlign} from "./Text/TextAlign";

export class Game extends AnimatedEntity {
    private readonly options: Options;

    private alienField: AlienField;
    private shields: Shields;
    private bulletPool: BulletPool;
    private ship: Ship;

    private text: TextDisplay;
    private startTime: number = 0;
    private timeText: SimpleText;

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
        this.alienField.y = 160;
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
        this.ship.on("dodge", this.onPlayerDodge.bind(this));
        this.addChild(this.ship);

        this.text = new TextDisplay();
        this.text.addText(this.options.playerName, 7, 0);
        this.timeText = this.text.addText('', 480, 80, TextAlign.RIGHT);
        this.addChild(this.text);

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
        this.controller.start();
        super.start();

        this.startTime = Date.now();

        this.text.explode("Start!", 240, 540, -10, 2350);
    }

    public stop(): void {
        this.controller.stop();
        super.stop();
    }

    protected tick(elapsed: number): void {
        this.bulletPool.testHit(this.alienField);
        this.bulletPool.testHit(this.shields);
        this.bulletPool.testHit(this.ship);

        this.updatePlayTime();

        if (this.alienField.getRemainingAliens().length == 0) {
            this.win();
        }
    }

    private updatePlayTime(): void {
        let playTime = (Date.now() - this.startTime) / 1000;
        let playMinutes = Math.floor(playTime / 60);
        let playSeconds = Math.floor(playTime - (playMinutes * 60));
        let playSecondsPrefix = playSeconds < 10 ? '0' : '';
        this.timeText.update(`${playMinutes}:${playSecondsPrefix}${playSeconds}`);
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

    private onPlayerDodge(): void {
        this.text.explode("dodge!", this.ship.x, this.ship.y + 25, 10, 150);
    }

    private win(): void {
        console.log("Player wins!");
        this.controller.gameOver();
        this.text.explode("You win!");
        this.stop();
    }

    private lose(): void {
        console.log("Player loses :(");
        this.text.explode("You lose!");
        this.controller.gameOver();
        this.stop();
    }
}