import Application = PIXI.Application;
import {Game} from "./Execut/Game";
import {Options} from "./Execut/Options";
import {Result} from "./Execut/Result";
import {PlayerSettings} from "./Execut/PlayerSettings";

PIXI.loader
    .add([
        "./assets/game/images/alien01.png",
        "./assets/game/images/alien02.png",
        "./assets/game/images/alien03.png",
        "./assets/game/images/alien04.png",
        "./assets/game/images/alien05.png",
        "./assets/game/images/alien06.png",
        "./assets/game/images/alien07.png",
        "./assets/game/images/alienskull.png",
        "./assets/game/images/bullet.png",
        "./assets/game/images/alienbullet.png",
        "./assets/game/images/explosion0.png",
        "./assets/game/images/explosion1.png",
        "./assets/game/images/explosion2.png",
        "./assets/game/images/explosion3.png",
        "./assets/game/images/explosion4.png",
        "./assets/game/images/ship.png",
        "./assets/game/images/ship_shield.png",
    ]);

let app = new Application(1920, 1080);
// app.stage.scale = new Point(0.75, 0.75);

// @ts-ignore We know it's not null
document.getElementById("gameContainer").appendChild(app.view);

let results: Array<Result> = [];

// @ts-ignore
window["start"] = function(player1: PlayerSettings, player2: PlayerSettings, player3: PlayerSettings, player4: PlayerSettings) {
    results = [];

    app.stage.children
        .filter(c => c instanceof Game)
        .forEach(g => {
            (g as Game).stop();
        });

    for (let i = app.stage.children.length - 1; i >= 0; i--) {
        app.stage.removeChild(app.stage.children[i]);
    }

    // player1 = player1 || {
    //     playerName: 'Speedy',
    //     shipSpeed: 30,
    //     shipBulletSpeed: 25,
    //     shipFireInterval: 800,
    //     shipDodgeChance: 0.3,
    //     shipShields: 1,
    //     shieldThickness: 2,
    //     shieldWidth: 4,
    //     alienMoveDown: 1,
    //     alienFireInterval: 2000,
    // };
    //
    // player2 = player2 || {
    //     playerName: 'Shooty',
    //     shipSpeed: 20,
    //     shipBulletSpeed: 25,
    //     shipFireInterval: 600,
    //     shipDodgeChance: 0.3,
    //     shipShields: 1,
    //     shieldThickness: 2,
    //     shieldWidth: 4,
    //     alienMoveDown: 1,
    //     alienFireInterval: 2000,
    // };
    //
    // player3 = player3 || {
    //     playerName: 'Rockety',
    //     shipSpeed: 20,
    //     shipBulletSpeed: 40,
    //     shipFireInterval: 800,
    //     shipDodgeChance: 0.3,
    //     shipShields: 1,
    //     shieldThickness: 2,
    //     shieldWidth: 4,
    //     alienMoveDown: 1,
    //     alienFireInterval: 2000,
    // };
    //
    // player4 = player4 || {
    //     playerName: 'Dodgy',
    //     shipSpeed: 20,
    //     shipBulletSpeed: 25,
    //     shipFireInterval: 800,
    //     shipDodgeChance: 0.5,
    //     shipShields: 1,
    //     shieldThickness: 2,
    //     shieldWidth: 4,
    //     alienMoveDown: 1,
    //     alienFireInterval: 2000,
    // };

    let games = [
        new Game(Options.fromSettings(player1)),
        new Game(Options.fromSettings(player2)),
        new Game(Options.fromSettings(player3)),
        new Game(Options.fromSettings(player4)),
    ];

    games.forEach((g, i) => {
        g.x = i * 480;
        app.stage.addChild(g);
        g.on("end", registerGameResult)
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


function registerGameResult(result: Result): void {
    results.push(result);
    if (results.length == 4) {
        // @ts-ignore Provided by framework
        sendMatchResult(results);
    }
}
