import Graphics = PIXI.Graphics;
import DisplayObject = PIXI.DisplayObject;

export class Background extends Graphics {
    private color = Math.random() * 360;
    private readonly colorSpeed = 1 + Math.random() * 3; //100ms


    constructor() {
        super();
        // this.on("added", this.onAdded);
        // this.on("removed", this.onRemoved);
        this.beginFill(0x333333);
        this.drawRect(0, 0, 480, 1080);

    }

    private onAdded(parent: DisplayObject): void {
        PIXI.ticker.shared.add(this.tick, this);
    }

    private onRemoved(parent: DisplayObject): void {
        PIXI.ticker.shared.remove(this.tick, this);
    }

    private tick(): void {
        // poor man's rainbow
        this.color += PIXI.ticker.shared.elapsedMS / 100 * this.colorSpeed;
        this.color %= 360;
        let red = this.color >= 0 && this.color < 240
            ? Math.floor((120 - Math.abs(this.color - 120)) / 120 * 255)
            : 0;
        let green = this.color >= 120 && this.color < 360
            ? Math.floor((120 - Math.abs(this.color - 240)) / 120 * 255)
            : 0;
        let blue = 0;
        if (this.color >= 240) {
            blue = Math.floor((120 - Math.abs(this.color - 360)) / 120 * 255);
        } else if (this.color < 120) {
            blue = Math.floor((120 - this.color) / 120 * 255);
        }

        this.clear();
        this.beginFill(red << 16 | green << 8 | blue);
        this.drawRect(0, 0, 480, 1080);
    }

}