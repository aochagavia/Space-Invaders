import socketio from 'socket.io';
import express from 'express';
import bodyparser from 'body-parser';
import Joi from 'joi';
import { Server } from 'http';
import { State } from './state';

const app = express();
const http = new Server(app);
const io = socketio(http);

const state = new State();

io.on('connection', socket => {
    // TODO: get this key from the environment
    if (socket.handshake.query.apiKey !== 'superSecureKeyNoOneWillEverGuess!') {
        console.info('Attempt to connect with invalid API key', socket.handshake.query);
        socket.disconnect(true);
        return;
    }

    socket.emit('dashboard', state.asDashboard());

    socket.on('registerMatchServer', () => {
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
            // TODO: validate input?
            state.matchFinished(players);

            // There might be people in the waiting list
            maybeStartMatch();

            // Update the dashboard
            io.emit('dashboard', state.asDashboard());
        });
    });
});

// CORS headers, required for POSTing data
app.use(function(_, res, next) {
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

const schema = Joi.object().keys({
    nickname: Joi.string().min(3).max(50).required(),
});
app.post('/new-player', (req, res) => {
    // TODO: authorization
    schema.validate<{ nickname: string}>(req.body).then(player => {
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
