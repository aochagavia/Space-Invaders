import { Dashboard } from 'shared/lib/dashboard.model';
import { Player } from 'shared/lib/player.model';
import { Socket } from 'socket.io';
import storage from 'node-persist';

const LEADERBOARD_LENGTH = 10;
const LOSERBOARD_LENGTH = 3;
const PLAYERS_PER_MATCH = 4;

export class State {
    private waiting: Player[] = [];
    private playing: Player[] = [];
    private finished: Player[] = [];
    private matchServerSocket?: Socket = undefined;

    // A cache of the leaderboard to avoid recalculating it every time
    private leaderboard: Player[] = [];
    private loserboard: Player[] = [];
    private totalPlayers: number = 0;

    get matchServerOnline(): boolean {
        return this.matchServerSocket !== undefined;
    }

    static async fromSnapshot(): Promise<State> {
        const obj = await storage.getItem('state');
        const state = new State();

        if (obj) {
            console.log('Loading from snapshot...');

            state.waiting = obj.waiting;
            state.playing = obj.playing;
            state.finished = obj.finished;

            // Evil hack to recalculate cached data
            state.matchFinished([]);

            console.log('Players waiting:', state.waiting.length);
            console.log('Players playing:', state.playing.length);
            console.log('Players finished:', state.finished.length);
            console.log('Players in leaderboard:', state.leaderboard.length);
        } else {
            console.log('No snapshot information available');
        }

        return state;
    }

    async makeSnapshot() {
        console.time('snapshot');

        // We make a copy to avoid making a snapshot of the matchServerSocket
        const copy = new State();
        copy.waiting = this.waiting;
        copy.playing = this.playing;
        copy.finished = this.finished;

        await storage.setItem('state', copy);

        console.timeEnd('snapshot');
    }

    takenNicknames(): string[] {
        const players = this.playing.concat(this.waiting).concat(this.finished);
        return players.map(p => p.nickname);
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
        this.makeSnapshot();

        this.matchServerSocket = undefined;
    }

    canStartMatch(): boolean {
        return this.matchServerOnline && this.playing.length === 0 && this.waiting.length >= PLAYERS_PER_MATCH;
    }

    newMatch(): Player[] {
        this.playing = this.waiting.slice(0, PLAYERS_PER_MATCH);
        this.waiting = this.waiting.slice(PLAYERS_PER_MATCH);
        this.makeSnapshot();

        return this.playing;
    }

    newPlayer(player: Player) {
        this.waiting.push(player);
        this.makeSnapshot();
    }

    matchFinished(players: Player[]) {
        this.playing = [];
        this.finished = this.finished
            .concat(players)
            .sort((p1, p2) => {
                if (p1.kills > p2.kills) return -1;
                if (p1.kills < p2.kills) return 1;

                // Note: here p1.kills equals p2.kills
                // Therefore p1.won implies p2.won
                if (p1.won) return p1.time < p2.time ? -1 : 1;
                else return p1.time > p2.time ? -1 : 1;
            })
        
        this.leaderboard = this.finished.slice(0, LEADERBOARD_LENGTH);
        
        const loserboardStart = Math.max(0, this.finished.length - LOSERBOARD_LENGTH);
        this.loserboard = this.finished.slice(loserboardStart);

        this.totalPlayers = this.finished.length;

        this.makeSnapshot();
    }

    asDashboard(): Dashboard {
        return new Dashboard(this.waiting, this.playing, this.leaderboard, this.loserboard, this.totalPlayers, this.matchServerOnline);
    }
}
