import {CenteredText} from "./CenteredText";
// @ts-ignore IJ cannot find file but it's there
import {TweenLite} from "gsap/all";
import {Direction} from "./Direction";
import Point = PIXI.Point;


export class ExplodingText extends CenteredText {
    constructor(pixiText: PIXI.Text, duration: number = 1000, rotation = Direction.RANDOM) {
        super(pixiText);
        this.scale = new Point(0.5, 0.5);

        let rotationStart = 2 + Math.random() * 4;
        let rotationEnd = - 2 - Math.random() * 4;

        if (rotation == Direction.RIGHT || (rotation == Direction.RANDOM && Math.random() < 0.5)) {
            [rotationStart, rotationEnd] = [rotationEnd, rotationStart];
        }

        this.rotation = rotationStart * Math.PI / 180;
        TweenLite.to(this, duration / 1000, {pixi: {scaleX: 1, scaleY: 1, rotation: rotationEnd }});
        TweenLite.to(this, duration / 2000, {pixi: {alpha: 0}, delay: duration / 2000});
    }
}
