import Container = PIXI.Container;
import {TextAlign} from "./TextAlign";

export class SimpleText extends Container {

    protected pixiText: PIXI.Text;

    constructor(pixiText: PIXI.Text) {
        super();
        this.pixiText = pixiText;
        this.addChild(pixiText);
    }

    public tick(factor: number): void {

    }
    public update(text: string): void {
        this.pixiText.text = text;
    }
}