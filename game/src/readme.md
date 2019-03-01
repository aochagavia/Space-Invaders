# Space Invaders

Requires NPM.  
Don't forget to install all the dependencies:
```sh
    $ npm install
```

Dev server:
```sh
    $ npm run dev
```
Usually it serves on http://localhost:8080 but it will find the next free port if 8080 is in use.

Build:
```sh
    $ npm run build
```

For now:  
//todo: update

To run in the browser, open console, then run with the defaults from `index.ts`:
```javascript
    start();
```

Or create players:
```javascript
    let player1 = {
        playerName: 'Speedy',
        shipSpeed: 30,
        shipBulletSpeed: 25,
        shipFireInterval: 800,
        shipDodgeChance: 0.3,
        shipShields: 1,
        shieldThickness: 2,
        shieldWidth: 4,
        alienMoveDown: 1,
        alienFireInterval: 2000,
    };
    let player2 = { /* … */ };
    let player3 = { /* … */ };
    let player4 = { /* … */ };
    start(player1, player2, player3, player4);
```