"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = __importDefault(require("socket.io"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const joi_1 = __importDefault(require("joi"));
const http_1 = require("http");
const state_1 = require("./state");
const app = express_1.default();
const http = new http_1.Server(app);
const io = socket_io_1.default(http, { allowRequest: (data, callback) => {
        // TODO: require API key here if we go for authorization alternative 1, since that means only our code should have
        // access to sockets
        const req = data;
        // console.log('Auth', req.headers.authorization);
        callback(0, true);
    } });
const state = new state_1.State();
// TODO: figure out the authorization story.
// Alternative 1: registration form is one SPA. The dashboard and the match server are other SPA, protected by a .htaccess-like mechanism
// Alternative 2: registration form and dashboard are one SPA. The match server is a separate SPA protected by a .htaccess-like mechanism
// Do we want people to see the dashboard on their phones? I would say no... That way they have to come to our stand to see it!
// TODO: figure out the DDOS story
// There is little we can do if someone seriously wants to DDoS us. Should we try to prevent it? Maybe restrict the amount of
// registrations per second?
// TODO: display in the dashboard a message if the websockets connection has been lost?
// TODO: figure out a way to recover from crashes
// Idea: poll the server to get the state once a minute, keep it somewhere safe, create an endpoint to restore it if necessary
// Idea: write once a minute to mongodb
// Idea: write once a minute to redis
// Drawbacks: adding code to recover from crashes increases the chances of crashing :/
io.on('connection', socket => {
    socket.emit('dashboard', state.asDashboard());
    socket.on('registerMatchServer', apiKey => {
        // TODO: specify the API key in the environment
        // TODO: maybe remove the apiKey stuff here
        if (apiKey !== 'superSecureKeyNoOneWillEverGuess!') {
            // tslint:disable-next-line:no-console
            console.info('Attempt to connect with invalid API key:', apiKey);
            socket.disconnect(true);
            return;
        }
        state.registerMatchServer(socket);
        io.emit('dashboard', state.asDashboard());
        // There might be people in the waiting list
        maybeStartMatch();
        socket.on('disconnect', () => {
            state.unregisterMatchServer();
            io.emit('dashboard', state.asDashboard());
        });
        // We only accept matchFinished messages from this particular socket, which we trust
        // because it has the right apiKey
        socket.on('matchFinished', players => {
            // TODO: validate input
            state.matchFinished(players);
            // There might be people in the waiting list
            maybeStartMatch();
            // Update the dashboard
            io.emit('dashboard', state.asDashboard());
        });
    });
});
// CORS headers, required for POSTing data
app.use(function (_, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
app.use(body_parser_1.default.json());
function maybeStartMatch() {
    if (state.canStartMatch()) {
        const playingPlayers = state.newMatch();
        io.emit('dashboard', state.asDashboard());
        io.emit('match-start', playingPlayers);
    }
}
const schema = joi_1.default.object().keys({
    nickname: joi_1.default.string().min(3).max(50).required(),
});
app.post('/new-player', (req, res) => {
    // TODO: authorization (probably not necessary)
    schema.validate(req.body).then(player => {
        // TODO: reject duplicated nicknames?
        state.newPlayer(player.nickname);
        // Trigger new match if possible
        maybeStartMatch();
        res.sendStatus(204);
        io.emit('dashboard', state.asDashboard());
    }).catch(() => {
        res.sendStatus(400);
    });
});
http.listen(4444);
console.log('Server started');
