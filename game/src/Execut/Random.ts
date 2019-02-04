export class Random {
    constructor(seed: String) {

    }

    next(): number {
        // todo: make seeded
        return Math.random();
    }
}