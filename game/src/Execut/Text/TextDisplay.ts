import Container = PIXI.Container;
import DisplayObject = PIXI.DisplayObject;
import {SimpleText} from "./SimpleText";
import {ExplodingText} from "./ExplodingText";
import {TextAlign} from "./TextAlign";
import {AlignedText} from "./AlignedText";
import {FadingUpText} from "./FadeingUpText";

export class TextDisplay extends Container {

    private readonly colors = [
        '#ff6633',
        '#ff33cc',
        '#00ffff',
        '#cc0000',
        '#9900ff',
        '#ffffff',
        '#ffff00',
        '#66ff33',
    ];

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

    public addText(text: string, x: number, y: number, alignment: TextAlign = TextAlign.LEFT, color: number = 0xffffff, fontsize: number = 20): SimpleText {
        let colorStr = color.toString(16);
        while (colorStr.length < 6) {
            colorStr = '0' + colorStr;
        }
        colorStr = '#' + colorStr;

        let style = new PIXI.TextStyle({
            fontFamily: "si",
            fontSize: fontsize,
            fill: colorStr,
        });

        let alignedText = new AlignedText(new PIXI.Text(text, style), alignment);
        alignedText.x = x;
        alignedText.y = y;

        this.addChild(alignedText);

        return alignedText;
    }

    // animate and random colours and other fun stuff!
    public explode(text: string, x = 240, y = 540, duration = 1000, fontSize = 80): void {
        let style = new PIXI.TextStyle({
            fontFamily: "si",
            fontSize: fontSize,
            fill: this.colors[Math.floor(Math.random() * this.colors.length)],
        });

        let explodingText = new ExplodingText(new PIXI.Text(text, style), duration);
        explodingText.x = x;
        explodingText.y = y;

        this.addChild(explodingText);

        setTimeout(() => {
            this.removeChild(explodingText);
        }, duration);
    }

    public fadeUp(text: string, x = 240, y = 540, duration = 1000): void {
        let style = new PIXI.TextStyle({
            fontFamily: "si",
            fontSize: 40,
            fill: this.colors[Math.floor(Math.random() * this.colors.length)],
        });

        let fadingUpText = new FadingUpText(new PIXI.Text(text, style), duration);
        fadingUpText.x = x;
        fadingUpText.y = y;

        this.addChild(fadingUpText);

        setTimeout(() => {
            this.removeChild(fadingUpText);
        }, duration);
    }

    private tick():void {
        let f = PIXI.ticker.shared.elapsedMS / 100;
        this.children
            .filter(c => c instanceof SimpleText)
            .forEach(c => (c as SimpleText).tick(f));
    }
}