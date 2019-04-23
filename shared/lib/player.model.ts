export class Player {
    constructor(
        public id: number,
        public nickname: string,
        public kills: number,
        public won: boolean,
        public time: number,
        public settings: PlayerSettings,
    ) {}
}

export class PlayerSettings {
    constructor(
        public shipShields: number,
        public firePower: number,
        public dodgeChance: number,
        public defenseThickness: number,
        public defenseWidth: number,
    ) {}
}