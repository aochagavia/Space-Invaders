import {CenteredText} from "./CenteredText";
import Point = PIXI.Point;
// @ts-ignore IJ cannot find file but it's there
import {TweenLite} from "gsap/all";


export class FadingUpText extends CenteredText {
    constructor(pixiText: PIXI.Text, duration: number = 1000) {
        super(pixiText);
        setTimeout(() => {
            TweenLite.to(this, duration / 1000, {pixi: {y: this.y - parseFloat(pixiText.style.fontSize as string) / 3}});
            TweenLite.to(this, duration / 1500, {pixi: {alpha: 0}, delay: duration / 3000});
        }, 0);
    }
}