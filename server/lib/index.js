"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socketio = __importStar(require("socket.io"));
const express = __importStar(require("express"));
const app = express.default();
const http = new http_1.Server(app);
const io = socketio.default(http);
io.on('connection', socket => {
    socket.emit('waiting-room', ['Pepe', 'Goma']);
});
app.post('new-player', req => {
    console.log(req.body);
});
http.listen(4444);
console.log('Server started again');
// TODO: emit more waiting-room events upon console input
