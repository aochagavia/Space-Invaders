import {SimpleText} from "./SimpleText";

export class CenteredText extends SimpleText {
    constructor(pixiText: PIXI.Text) {
        super(pixiText);
        this.recenter();
    }

    public update(text: string): void {
        super.update(text);
        this.recenter();
    }

    private recenter(): void {
        this.pixiText.x = -this.pixiText.width / 2;
        this.pixiText.y = -this.pixiText.height / 2;
    }
}