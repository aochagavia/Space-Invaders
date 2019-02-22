import {CenteredText} from "./CenteredText";
import Point = PIXI.Point;
// @ts-ignore IJ cannot find file but it's there
import {TweenLite} from "gsap/all";


export class FadingUpText extends CenteredText {
    constructor(pixiText: PIXI.Text, duration: number = 1000) {
        super(pixiText);
        TweenLite.to(this, duration / 1000, {pixi: {alpha: 0}, y: this.y - 30});
    }
}