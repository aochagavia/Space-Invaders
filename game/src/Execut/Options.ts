import {PlayerSettings} from "./PlayerSettings";

export class Options {
    // speeds are px per 100ms

    public static fromSettings (settings: PlayerSettings): Options {
        return {
            playerName: settings.nickname,

            shipSpeed: 15,

            shipBulletSpeed: Math.floor(settings.settings_FIREPOWER * 3 + 15), // 0-10
            shipFireInterval: 2250 - settings.settings_FIREPOWER * 150, // 0-10
            // @ts-ignore settings.settings_DODGE_CHANCE is actually a string
            shipDodgeChance: Math.log(parseInt(settings.settings_DODGE_CHANCE) + 1) * 22 * 0.01, // 0-10
            shipShields: Math.floor(settings.settings_SHIELDS), // 0-4
            shieldThickness: Math.floor(settings.settings_DEFENSE_HEIGHT), // 0-10
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
