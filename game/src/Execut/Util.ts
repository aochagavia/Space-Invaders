import Rectangle = PIXI.Rectangle;
import Container = PIXI.Container;

export class Util {
    static containersIntersect(a: Container, b: Container): boolean {
        return Util.rectanglesIntersect(
            a.getBounds(true),
            b.getBounds(true),
        );
    }

    static rectanglesIntersect(a: Rectangle, b: Rectangle): boolean {
        return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    }

    static colorFromRgb(red: number, green: number, blue: number): number {
        return red << 16 | green << 8 | blue;
    }
}