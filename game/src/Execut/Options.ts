import {PlayerSettings} from "./PlayerSettings";

export class Options {
    // speeds are px per 100ms

    public static fromSettings (settings: PlayerSettings): Options {
        return {
            playerName: settings.nickname,

            shipSpeed: 15,

            shipBulletSpeed: Math.floor(settings.settings_FIREPOWER * 5 + 5), // 0-10
            shipFireInterval: 3000 - (11 - settings.settings_FIREPOWER) * 150, // 0-10
            shipDodgeChance: Math.floor(settings.settings_DODGE_CHANGE * 0.05), // 0-10
            shipShields: Math.floor(settings.settings_SHIELDS), // 0-4
            shieldThickness: Math.floor(settings.settings_DEFENSE_THICKNESS), // 0-10
            shieldWidth: Math.floor(settings.settings_DEFENSE_WIDTH), // 0-10

            alienFireInterval: 3000,
            alienMoveDown: 0
        };
    }

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