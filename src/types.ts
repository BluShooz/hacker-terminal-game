export const GameState = {
    BOOTING: 'BOOTING',
    PLAYING: 'PLAYING',
    BOSS_INTRO: 'BOSS_INTRO',
    SUCCESS: 'SUCCESS'
} as const;

export type GameState = typeof GameState[keyof typeof GameState];

export type TierLevel = 1 | 2 | 3 | 4 | 5 | 6;
