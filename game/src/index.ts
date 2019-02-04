import Application = PIXI.Application;
import Point = PIXI.Point;
import {Game} from "./Execut/Game";
import {Options} from "./Execut/Options";

let games = [
    new Game(new Options()),
    // new Game(new Options()),
    // new Game(new Options()),
    // new Game(new Options()),
];

let app = new Application(1920, 1080);
app.stage.scale = new Point(0.9, 0.9);
games.forEach((g, i) => {
    g.x = i * 480;
    app.stage.addChild(g);
});

document.body.appendChild(app.view);

window.addEventListener('keydown', evt => {
    // hackity hack pause function
    if (evt.keyCode == 32) {
        if (PIXI.ticker.shared.started) {
            console.log("Stop ticker");
            PIXI.ticker.shared.stop();
        } else {
            console.log("Start ticker");
            games.forEach(g => g.start()); // resets lastFired etc
            PIXI.ticker.shared.start();
        }
    }
});

PIXI.loader
    .add([
        "./images/alien.png",
        "./images/bullet.png",
        "./images/alienbullet.png",
        "./images/explosion0.png",
        "./images/explosion1.png",
        "./images/explosion2.png",
        "./images/explosion3.png",
        "./images/explosion4.png",
    ])
    .add([
        "./images/0001.png"
    ])
    .load(() => {
        games.forEach(g => g.preloadFinished());
        setTimeout(() => {
            games.forEach(g => g.start());
        }, 1000);
    });

