export class Options {
    // speeds are px per 100ms

    public readonly playerName: string = 'Malle Beppe';

    public readonly shipSpeed: number = 10;
    public readonly shipBulletSpeed: number = 25;
    public readonly shipFireInterval: number = 800;
    public readonly shipDodgeChance: number = 0.3;
    public readonly shipShields: number = 0;

    public readonly shieldThickness: number = 0;
    public readonly shieldWidth: number = 4;

    public readonly alienFireInterval: number = 3000;
    public readonly alienMoveDown: number = 0.1;
}