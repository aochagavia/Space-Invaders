export class Player {
    constructor(
        public id: number,
        public nickname: string,
        public kills: number,
        public won: boolean,
        public time: number,
    ) {}
}
