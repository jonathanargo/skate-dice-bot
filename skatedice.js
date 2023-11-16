export const LEVELS = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard'
};

export const TRICK_TYPES = {
    FLATGROUND: 'flatground',
    TRANSITION: 'transition',
    LEDGE: 'ledge'
};

const TRICKS = {
    [TRICK_TYPES.FLATGROUND]: {
        [LEVELS.EASY]: [
            'Ollie',
            'Fakie Ollie',
            'Frontside 180',
            'Backside 180',
            'Pop Shove-It',
            'Fakie Pop Shove-It',
            'Frontside Pop Shove-It',
            'Fakie Frontside Pop Shove-It',
        ],
        [LEVELS.MEDIUM]: [
            'Kickflip',
            'Heelflip',
            'Half Cab Flip',
            'Frontside Flip',
            'Backside Flip',
        ],
        [LEVELS.HARD]: [
            'Hardflip',
            'Inward Heelflip',
            '360 Flip',
        ],
    },
    [TRICK_TYPES.TRANSITION]: {
        [LEVELS.EASY]: [
            'Rock to Fakie',
            'BS Rock and Roll',
        ],
        [LEVELS.MEDIUM]: [],
        [LEVELS.HARD]: []
    },
    [TRICK_TYPES.LEDGE]: {
        [LEVELS.EASY]: [
            'FS 50-50',
            'FS 5-0',
        ]
    }
}

export const GetTrick = (level, trickType) => {
    let tricksOfDifficulty = TRICKS[trickType][level];
    // Get random index
    let trickindex = Math.floor(Math.random() * tricksOfDifficulty.length);
    
    return tricksOfDifficulty[trickindex];
}