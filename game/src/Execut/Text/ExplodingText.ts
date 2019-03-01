import {CenteredText} from "./CenteredText";
import Point = PIXI.Point;
// @ts-ignore IJ cannot find file but it's there
import {TweenLite} from "gsap/all";


export class ExplodingText extends CenteredText {
    constructor(pixiText: PIXI.Text, duration: number = 1000) {
        super(pixiText);
        this.scale = new Point(0.5, 0.5);
        this.rotation = (2 + Math.random() * 4) * Math.PI / 180;
        TweenLite.to(this, duration / 1000, {pixi: {scaleX: 1, scaleY: 1, rotation: - 2 - Math.random() * 4}});
        TweenLite.to(this, duration / 2000, {pixi: {alpha: 0}, delay: duration / 2000});
    }
}