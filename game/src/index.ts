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
window["devStart"] = () => {
    const player1 = {
        nickname: 'Powerful Grievous',
        settings_DEFENSE_THICKNESS: 1, // 0-10
        settings_DEFENSE_WIDTH: 8, // 0-10
        settings_DODGE_CHANCE: 0, // 0-10
        settings_FIREPOWER: 0, // 0-10
        settings_SHIELDS: 1, //0-4
    };

    const player2 = {
        nickname: 'Balanced',
        settings_DEFENSE_THICKNESS: 0, // 0-10
        settings_DEFENSE_WIDTH: 2, // 0-10
        settings_DODGE_CHANCE: 2, // 0-10
        settings_FIREPOWER: 3, // 0-10
        settings_SHIELDS: 1, //0-4
    };

    const player3 = {
        nickname: 'Shieldy',
        settings_DEFENSE_THICKNESS: 0, // 0-10
        settings_DEFENSE_WIDTH: 0, // 0-10
        settings_DODGE_CHANCE: 0, // 0-10
        settings_FIREPOWER: 0, // 0-10
        settings_SHIELDS: 4, //0-4
    };

    const player4 = {
        nickname: 'Dodgy',
        settings_DEFENSE_THICKNESS: 0, // 0-10
        settings_DEFENSE_WIDTH: 0, // 0-10
        settings_DODGE_CHANCE: 10, // 0-10
        settings_FIREPOWER: 0, // 0-10
        settings_SHIELDS: 0, //0-4
    };

    // @ts-ignore
    window["start"](player1, player2, player3, player4);
};

// @ts-ignore
window["start"] = function(player1: PlayerSettings, player2: PlayerSettings, player3: PlayerSettings, player4: PlayerSettings) {
    app.stage.children
        .forEach(g => {
            if (g instanceof Game) g.stop();
        });

    for (let i = app.stage.children.length - 1; i >= 0; i--) {
        app.stage.removeChild(app.stage.children[i]);
    }

    results = [];

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
        setTimeout(() => {
            // @ts-ignore Provided by framework
            sendMatchResult(results);
        }, 15000);
    }
}
