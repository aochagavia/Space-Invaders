import Texture = PIXI.Texture;
import AnimatedSprite = PIXI.extras.AnimatedSprite;
import Container = PIXI.Container;

export class Explosion extends Container {
    private readonly sprite: AnimatedSprite;

    constructor() {
        super();

        let textures = [
            Texture.fromImage("./assets/game/images/explosion0.png"),
            Texture.fromImage("./assets/game/images/explosion1.png"),
            Texture.fromImage("./assets/game/images/explosion2.png"),
            Texture.fromImage("./assets/game/images/explosion3.png"),
            Texture.fromImage("./assets/game/images/explosion4.png"),
        ];

        this.sprite = new AnimatedSprite(textures);
        this.sprite.stop();
        this.sprite.visible = false;
        this.sprite.loop = false;
        this.sprite.animationSpeed = 0.3;
        this.addChild(this.sprite);

        this.sprite.onComplete = () => {
            this.sprite.visible = false;
        }
    }

    boom(): void {
        this.sprite.gotoAndPlay(0);
        this.sprite.visible = true;
    }
}