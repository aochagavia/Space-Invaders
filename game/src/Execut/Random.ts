export class Random {
    // Source: https://stackoverflow.com/a/47593316
    // Haven't looked for proof, but it seems to be good enough

    private a = 0;

    constructor(seed: String) {
        this.a = parseInt(seed.toLowerCase().replace(/[^0-9a-z]/g, ''), 36)
    }

    public next(): number {
        //return this.mulberry32();
        return Math.random();
    }

    private mulberry32(): number {
        let t = this.a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

}