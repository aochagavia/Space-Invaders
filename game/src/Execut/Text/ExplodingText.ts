import {CenteredText} from "./CenteredText";
import Point = PIXI.Point;
// @ts-ignore IJ cannot find file but it's there
import {TweenLite} from "gsap/all";


export class ExplodingText extends CenteredText {
    constructor(pixiText: PIXI.Text) {
        super(pixiText);
        this.scale = new Point(0.5, 0.5);
        this.rotation = 10 * Math.PI / 180;
        TweenLite.to(this, 1, {pixi: {scaleX: 1, scaleY: 1, alpha: 0, rotation: -20}});
    }
}