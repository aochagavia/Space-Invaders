"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dashboard_model_1 = require("./dashboard.model");
const LEADERBOARD_LENGTH = 20;
const PLAYERS_PER_MATCH = 2;
class State {
    constructor() {
        this.nextPlayerId = 0;
        this.waiting = [];
        this.playing = [];
        this.finished = [];
        this.matchServerSocket = undefined;
        // A cache of the leaderboard to avoid recalculating it every time
        this.leaderboard = [];
    }
    get matchServerOnline() {
        return this.matchServerSocket !== undefined;
    }
    registerMatchServer(socket) {
        if (this.matchServerOnline) {
            // tslint:disable-next-line:no-console
            console.info('Attempt to register a second match server');
            socket.disconnect(true);
            return;
        }
        this.matchServerSocket = socket;
    }
    unregisterMatchServer() {
        if (!this.matchServerOnline) {
            // tslint:disable-next-line:no-console
            console.info('Attempt to unregister match server when none is online');
        }
        // If any players were playing, bring them back to the waiting list
        this.waiting = this.playing.concat(this.waiting);
        this.playing = [];
        this.matchServerSocket = undefined;
    }
    canStartMatch() {
        return this.matchServerOnline && this.playing.length === 0 && this.waiting.length >= PLAYERS_PER_MATCH;
    }
    newMatch() {
        this.playing = this.waiting.slice(0, PLAYERS_PER_MATCH);
        this.waiting = this.waiting.slice(PLAYERS_PER_MATCH);
        return this.playing;
    }
    newPlayer(nickname) {
        const id = this.nextPlayerId;
        this.nextPlayerId++;
        this.waiting.push({ id, nickname, score: 0 });
    }
    matchFinished(players) {
        this.playing = [];
        // FIXME: sorting is currently broken because the client sends strings instead of numbers in the score
        this.leaderboard = this.leaderboard
            .concat(players)
            .sort((p1, p2) => p1.score > p2.score ? -1 : 1)
            .slice(0, LEADERBOARD_LENGTH);
        this.finished = this.finished.concat(players);
    }
    asDashboard() {
        return new dashboard_model_1.Dashboard(this.waiting, this.playing, this.leaderboard, this.matchServerOnline);
    }
}
exports.State = State;
