import { Server } from 'http';
import socketio from 'socket.io';
import express from 'express';
import bodyparser from 'body-parser';
import { State } from './state';

const app = express();
const http = new Server(app);
const io = socketio(http);

const state = new State();

// TODO: figure out the authorization story.
// Alternative 1: only the registration form is public. The dashboard and the match server are protected by a .htaccess-like mechanism
// Alternative 2: registration form and dashboard are public. We need to think about the best way to isolate the match server, to
// avoid people trying to hack us through malicious websockets messages

// TODO: figure out the DDOS story
// There is little we can do if someone seriously wants to DDoS us. Should we try to prevent it? Maybe restrict the amount of
// registrations per second?

// TODO: display in the client a message if the websockets connection has been lost

// TODO: figure out a way to recover from crashes
// Idea: poll the server to get the state once a minute, keep it somewhere safe, create an endpoint to restore it if necessary
// Idea: write once a minute to mongodb
// Idea: write once a minute to redis
// Drawbacks: adding code to recover from crashes increases the chances of crashing :/

// TODO: we are using websockets for one-way communication. Maybe we could use long-polling instead or HTTP2 server push?
io.on('connection', socket => {
    socket.emit('dashboard', state.asDashboard());
    // TODO: maybe we could pass an API key along with the data to verify the connection is trusted
    socket.on('registerMatchServer', () => {
        state.registerMatchServer(socket);
        io.emit('dashboard', state.asDashboard());

        // There might be people in the waiting list
        maybeStartMatch();

        socket.on('disconnect', () => {
            state.unregisterMatchServer();
            io.emit('dashboard', state.asDashboard());
        });
    });
});

// CORS headers
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(bodyparser.json());

function maybeStartMatch() {
    if (state.canStartMatch()) {
        const playingPlayers = state.newMatch();
        io.emit('dashboard', state.asDashboard());
        io.emit('match-start', playingPlayers);
    }
}

app.post('/new-player', (req, res) => {
    // TODO: authorization (maybe)
    // TODO: validate input
    // TODO: reject duplicated nicknames?
    const nickname = req.body.nickname;
    state.newPlayer(nickname);

    // Trigger new match if possible
    maybeStartMatch();

    io.emit('dashboard', state.asDashboard());
    res.sendStatus(204);
});

// TODO: we could move this to websockets... We are using them anyway
app.post('/match-finished', (req, res) => {
    // TODO: authorization (i.e. only accept requests from the matchServerSocket)
    // TODO: validate input
    state.matchFinished(req.body.players);

    // Trigger a new match if there are people waiting
    maybeStartMatch();

    // Update the dashboard
    io.emit('dashboard', state.asDashboard());
    res.sendStatus(204);
});

http.listen(4444);
console.log('Server started');
