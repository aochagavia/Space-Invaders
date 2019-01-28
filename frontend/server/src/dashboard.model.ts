import { Player } from './player.model';

export class Dashboard {
    constructor(
        public waiting: Player[],
        public playing: Player[],
        public leaderboard: Player[],
        public matchServerOnline: boolean,
    ) {}
}
