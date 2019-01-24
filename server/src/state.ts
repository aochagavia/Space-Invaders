import { Dashboard } from './dashboard.model';
import { Socket } from 'socket.io';
import { Player } from './player.model';

const LEADERBOARD_LENGTH = 20;
const PLAYERS_PER_MATCH = 2;

export class State {
    private nextPlayerId = 0;
    private waiting: Player[] = [];
    private playing: Player[] = [];
    private finished: Player[] = [];
    private matchServerSocket?: Socket = undefined;

    // A cache of the leaderboard to avoid recalculating it every time
    private leaderboard: Player[] = [];

    get matchServerOnline(): boolean {
        return this.matchServerSocket !== undefined;
    }

    registerMatchServer(socket: Socket) {
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

    canStartMatch(): boolean {
        return this.matchServerOnline && this.playing.length === 0 && this.waiting.length >= PLAYERS_PER_MATCH;
    }

    newMatch(): Player[] {
        this.playing = this.waiting.slice(0, PLAYERS_PER_MATCH);
        this.waiting = this.waiting.slice(PLAYERS_PER_MATCH);

        return this.playing;
    }

    newPlayer(nickname: string) {
        const id = this.nextPlayerId;
        this.nextPlayerId++;

        this.waiting.push({ id, nickname, score: 0 });
    }

    matchFinished(players: Player[]) {
        this.playing = [];

        // FIXME: sorting is currently broken because the client sends strings instead of numbers in the score
        this.leaderboard = this.leaderboard
            .concat(players)
            .sort((p1, p2) => p1.score > p2.score ? -1 : 1)
            .slice(0, LEADERBOARD_LENGTH);

        this.finished = this.finished.concat(players);
    }

    asDashboard(): Dashboard {
        return new Dashboard(this.waiting, this.playing, this.leaderboard, this.matchServerOnline);
    }
}
