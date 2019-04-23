var fs = require('fs');
fs.copyFile('dist/assets/game/bundle.js', '../frontend/src/assets/game/bundle.js', () => {});
fs.copyFile('dist/assets/game/bundle.js.map', '../frontend/src/assets/game/bundle.js.map', () => {});
