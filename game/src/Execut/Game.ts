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
// @ts-ignore IJ cannot find file but it's there
import {TweenLite} from "gsap/all";
import Graphics = PIXI.Graphics;
import Sprite = PIXI.Sprite;

export class Game extends AnimatedEntity {
    private readonly options: Options;

    private alienField: AlienField;
    private shields: Shields;
    private bulletPool: BulletPool;
    private ship: Ship;

    private startTime: number = 0;
    private kills: number = 0;

    private text: TextDisplay;

    private nameText: SimpleText;
    private timeLabelText: SimpleText;
    private timeText: SimpleText;

    private killsLabelText: SimpleText;
    private killsText: SimpleText;

    private line: Graphics;
    private skull: Sprite;

    private controller: Controller;

    constructor(options: Options) {
        super();
        this.options = options;

        // fixme: mask here and on bullets makes bullets disappear?
        // this.mask = new Graphics();
        // this.mask.drawRect(0, 0, 480, 1080);
        // this.addChild(this.mask);

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
        this.alienField.on("alienDeath", this.onAlienDeath.bind(this));
        this.addChild(this.alienField);

        this.shields = new Shields(this.options);
        this.shields.y = 854 - this.options.shieldThickness * 5;
        this.addChild(this.shields);

        this.bulletPool = new BulletPool();
        this.addChild(this.bulletPool);

        this.ship = new Ship(this.options);
        this.ship.y = 1000 - 30;
        this.ship.on("playerDeath",  this.onPlayerDeath.bind(this));
        this.ship.on("dodge", this.onPlayerDodge.bind(this));
        this.ship.on("shield", this.onPlayerShield.bind(this));
        this.addChild(this.ship);

        this.line = new Graphics();
        this.line.beginFill(0x66ff33);
        this.line.drawRect(0, 0, 480, 4);
        this.line.y = 1000;
        this.addChild(this.line);

        this.skull = new Sprite(PIXI.loader.resources[`./assets/game/images/alienskull.png`].texture);
        this.skull.x = 240 - this.skull.width / 2;
        this.skull.y = 1040 - this.skull.height / 2;
        this.addChild(this.skull);

        this.text = new TextDisplay();
        this.addChild(this.text);

        let name = this.options.playerName;
        if (name.length >= 23) {
            name = name.substr(0, 21) + '...';
        }
        this.nameText = this.text.addText(name, 28, 66.5, TextAlign.LEFT, 0xcc0000);

        this.timeLabelText = this.text.addText("TIME", 322, 66.5, TextAlign.LEFT, 0xffffff);
        this.timeText = this.text.addText('', 480 - 28, 66.5, TextAlign.RIGHT, 0x00ffff);
        this.killsLabelText = this.text.addText('KILLS:', 28, 1031, TextAlign.LEFT, 0xff6633);
        this.killsText = this.text.addText('0x0', 480-28, 1031, TextAlign.RIGHT, 0xff6633);

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

        this.text.explode("Start!", 240, 540,2350, 120);
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
        this.timeText.update(Game.formatTime(playTime));
    }

    private static formatTime(seconds: number): string {
        let playMinutes = Math.floor(seconds / 60);
        let playSeconds = Math.floor(seconds - (playMinutes * 60));
        let playSecondsPrefix = playSeconds < 10 ? '0' : '';
        return `${playMinutes}:${playSecondsPrefix}${playSeconds}`;
    }

    private onPlayerFire(x: number, speed: number): void {
        let bullet = this.bulletPool.getPlayerBullet();
        bullet.setSpeed(-speed); // bullets from player go up
        bullet.x = x;
        bullet.y = this.ship.y - 20;
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

    private onAlienDeath(): void {
        this.kills++;
        this.killsText.update(`0x${this.kills.toString(16)}`);
    }

    private onPlayerDodge(): void {
        this.text.fadeUp("dodge!", this.ship.x, this.ship.y + 25, 600);
    }

    private onPlayerShield(): void {
        this.text.fadeUp("shield!", this.ship.x, this.ship.y + 25, 600);
    }

    private win(): void {
        console.log("Player wins!");
        this.controller.gameOver();
        this.text.explode("You win!");
        this.stop();
        this.showEndState(true);
        this.emit("end", {
            name: this.options.playerName,
            won: true,
            kills: this.kills,
            time: (Date.now() - this.startTime) / 1000,
        });
    }

    private lose(): void {
        console.log("Player loses :(");
        this.text.explode("You lose!");
        this.controller.gameOver();
        this.stop();
        this.showEndState(false);
        this.emit("end", {
            nickname: this.options.playerName,
            won: false,
            kills: this.kills,
            time: (Date.now() - this.startTime) / 1000,
        });
    }

    private showEndState(won: boolean): void {
        const fadeOutTime = 500 / 1000;
        TweenLite.to([
            this.alienField,
            this.shields,
            this.bulletPool,
            this.ship,
            this.nameText,
            this.timeLabelText,
            this.timeText,
            this.line,
            this.killsLabelText,
            this.killsText,
            this.skull,
        ], fadeOutTime, {pixi: {alpha: 0}});

        const playTime = (Date.now() - this.startTime) / 1000;

        const textSize = 60;
        const textSpacing = 15;

        const start = 900;
        const pause = 600;

        setTimeout(() => {
            if (won) {
                this.text.addText('YOU WON!', 240, 540 - textSize / 2 - textSpacing - textSize, TextAlign.CENTER, 0x66ff33, textSize);
            } else {
                this.text.addText('YOU LOST!', 240, 540 - textSize / 2 - textSpacing - textSize, TextAlign.CENTER, 0xcc0000, textSize);
            }
        }, start);

        setTimeout(() => {
            this.text.addText(Game.formatTime(playTime), 240, 540 - textSize / 2, TextAlign.CENTER, 0x00ffff, textSize);
        }, start + pause);

        setTimeout(() => {
            this.text.addText(`KILLS: 0x${this.kills.toString(16)}`, 240, 540 + textSize / 2 + textSpacing, TextAlign.CENTER, 0xff6633, textSize);
        }, start + pause * 2);

        setTimeout(() => {
            const t = this.text.addCenteredText(this.options.playerName, 240, 540, 30, 0xffffff);
            t.rotation = -30 * Math.PI / 180;

            const minAngle = 0.3;
            const maxAngle = 1.1525719972156676; // Math.atan(1080 / 480)
            let a = minAngle;
            const w = t.width + 40;
            if (w > 480) {
                a = Math.max(minAngle, Math.min(maxAngle, Math.acos(480 / w)))
            }
            t.rotation = -a;

        }, start + pause * 3)

    }
}