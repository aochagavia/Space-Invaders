import Container = PIXI.Container;
import DisplayObject = PIXI.DisplayObject;
import {SimpleText} from "./SimpleText";
import {ExplodingText} from "./ExplodingText";
import {TextAlign} from "./TextAlign";
import {AlignedText} from "./AlignedText";

export class TextDisplay extends Container {

    constructor() {
        super();
        this.on("added", this.onAdded);
        this.on("removed", this.onRemoved);
    }

    private onAdded(parent: DisplayObject): void {
        PIXI.ticker.shared.add(this.tick, this);
    }

    private onRemoved(parent: DisplayObject): void {
        PIXI.ticker.shared.remove(this.tick, this);
    }

    public addText(text: string, x: number, y: number, alignment: TextAlign = TextAlign.LEFT): SimpleText {
        let style = new PIXI.TextStyle({
            fontFamily: "threed",
            fontSize: 80,
            fill: "white",
        });

        let alignedText = new AlignedText(new PIXI.Text(text, style), alignment);
        alignedText.x = x;
        alignedText.y = y;

        this.addChild(alignedText);

        return alignedText;
    }

    // animate and random colours and other fun stuff!
    public explode(text: string, x = 240, y = 540, rotation = 0, duration = 0): void {
        let style = new PIXI.TextStyle({
            fontFamily: "threed",
            fontSize: 160,
            fill: "white",
        });

        let explodingText = new ExplodingText(new PIXI.Text(text, style));
        explodingText.x = x;
        explodingText.y = y;

        this.addChild(explodingText);

        if (duration > 0) {
            setTimeout(() => {
                this.removeChild(explodingText);
            }, duration);
        }
    }

    private tick():void {
        let f = PIXI.ticker.shared.elapsedMS / 100;
        this.children
            .filter(c => c instanceof SimpleText)
            .forEach(c => (c as SimpleText).tick(f));
    }
}