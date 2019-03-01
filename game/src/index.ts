import Application = PIXI.Application;
import {Game} from "./Execut/Game";
import {Options} from "./Execut/Options";

PIXI.loader
    .add([
        "./images/alien01.png",
        "./images/alien02.png",
        "./images/alien03.png",
        "./images/alien04.png",
        "./images/alien05.png",
        "./images/alien06.png",
        "./images/alien07.png",
        "./images/bullet.png",
        "./images/alienbullet.png",
        "./images/explosion0.png",
        "./images/explosion1.png",
        "./images/explosion2.png",
        "./images/explosion3.png",
        "./images/explosion4.png",
        "./images/ship.png",
        "./images/ship_shield.png",
    ]);

let app = new Application(1920, 1080);
// app.stage.scale = new Point(0.75, 0.75);

// @ts-ignore We know it's not null
document.getElementById("gameContainer").appendChild(app.view);

// @ts-ignore
window["start"] = function(player1: Options, player2: Options, player3: Options, player4: Options) {
    app.stage.children
        .filter(c => c instanceof Game)
        .forEach(g => {
            (g as Game).stop();
        });

    for (let i = app.stage.children.length - 1; i >= 0; i--) {
        app.stage.removeChild(app.stage.children[i]);
    }

    player1 = player1 || {
        playerName: 'Olle Bolle',
        shipSpeed: 20,//15,
        shipBulletSpeed: 25,//30,
        shipFireInterval: 800,
        shipDodgeChance: 0.3,
        shieldThickness: 2,
        shipShield: false,
    };

    let games = [
        new Game(player1 || new Options()),
        new Game(player2 || new Options()),
        new Game(player3 || new Options()),
        new Game(player4 || new Options()),
    ];

    games.forEach((g, i) => {
        g.x = i * 480;
        app.stage.addChild(g);
    });

    PIXI.loader
        .load(() => {
            games.forEach(g => g.preloadFinished());
            setTimeout(() => {
                games.forEach(g => g.start());
            }, 1000);
        });


};

window.addEventListener('keydown', evt => {
    // hackity hack pause function
    if (evt.keyCode == 32) {
        if (PIXI.ticker.shared.started) {
            console.log("Stop ticker");
            PIXI.ticker.shared.stop();
        } else {
            console.log("Start ticker");
            // games.forEach(g => g.start()); // resets lastFired etc
            PIXI.ticker.shared.start();
        }
    }
});


