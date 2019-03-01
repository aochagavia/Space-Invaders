import Graphics = PIXI.Graphics;

export class Background extends Graphics {

    constructor() {
        super();
        this.beginFill(0x000000);
        this.drawRect(0, 0, 480, 1080);
        this.beginFill(0x333333);
        this.drawRect(479, 0, 1, 1080);
    }

}