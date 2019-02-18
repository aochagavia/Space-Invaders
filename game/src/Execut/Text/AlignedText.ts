import {SimpleText} from "./SimpleText";
import {TextAlign} from "./TextAlign";

export class AlignedText extends SimpleText {

    protected alignment: TextAlign

    constructor(pixiText: PIXI.Text, alignment: TextAlign = TextAlign.LEFT) {
        super(pixiText);
        this.alignment = alignment;
        this.align(this.alignment)
    }

    update(text: string): void {
        super.update(text);
        this.align(this.alignment)
    }

    public align(alignment: TextAlign): void {
        this.alignment = alignment;

        switch (alignment) {
            case TextAlign.LEFT:
                this.pixiText.x = 0;
                break;
            case TextAlign.RIGHT:
                this.pixiText.x = -this.pixiText.width;
                break;
            case TextAlign.CENTER:
                this.pixiText.x = -this.pixiText.width / 2;
        }
    }
}