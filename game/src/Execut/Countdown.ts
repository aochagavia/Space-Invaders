import Container = PIXI.Container;
import {TextDisplay} from "./Text/TextDisplay";
import {Direction} from "./Text/Direction";

export class Countdown extends Container {
    private text = new TextDisplay();

    constructor() {
        super();
        this.addChild(this.text);
    }

    public countDown(): void
    {
        const x = 960;
        const y = 540;
        const size = 500;

        this.text.explode('3', x, y, 1000, size, Direction.RIGHT);

        setTimeout(() => {
            this.text.explode('2', x, y, 1000, size, Direction.LEFT);
        }, 1000);

        setTimeout(() => {
            this.text.explode('1', x, y, 1000, size, Direction.RIGHT);
        }, 2000);

        setTimeout(() => {
            this.text.explode('START', x, y, 1000, size, Direction.LEFT);
        }, 3000);
    }

}
