import 'dotenv/config';

import {
    MessageComponentTypes,
    ButtonStyleTypes,
} from 'discord-interactions';

export const LEVELS = {
    EASY: 1,
    MEDIUM: 2,
    HARD: 3
};

export const LEVEL_NAMES = {
    [LEVELS.EASY]: 'Easy',
    [LEVELS.MEDIUM]: 'Medium',
    [LEVELS.HARD]: 'Hard'
}

export const TRICK_TYPES = {
    FLATGROUND: 'flatground',
    TRANSITION: 'transition',
    LEDGE: 'ledge'
};

// TODO JSA - Implement these
export const GAME_STATES = {
    NEW_GAME: 'newgame',
    AWAITING_TRICK_TYPE: 'awaitingtricktype',
    AWAITING_TRICK_RESULT: 'awaitingtrickresult'
};

export const GAME_STATE_NAMES = {
    [GAME_STATES.NEW_GAME]: 'New Game',
    [GAME_STATES.TRICK_TYPE_SELECTED]: 'Waiting On Trick Type Selection',
    [GAME_STATES.TRICK_RESULT]: 'Waiting on Trick Result'
};

const TRICKS = {
    [TRICK_TYPES.FLATGROUND]: {
        [LEVELS.EASY]: [
            'Ollie',
            'Fakie Ollie',
            'FS 180',
            'BS 180',
            'BS Pop Shove-It',
            'Fakie Pop Shove-It',
            'FS Pop Shove-It',
            'Fakie FS Pop Shove-It',
            'Half Cab',
            'Nollie BS Shuvit',
            'Nollie FS Shuvit',
            'Nollie BS 180',
        ],
        [LEVELS.MEDIUM]: [
            'Kickflip',
            'Heelflip',
            'Half Cab Flip',
            'FS Flip',
            'BS Flip',
            'Full Cab',
            'Nollie BS 180',
            'Varial Kickflip',
            'Varial Heelflip',
            'Half Cab Heelflip',
            'Fakie FS 180 Kickflip',
            'Fakie FS 180 Heelflip',
        ],
        [LEVELS.HARD]: [
            'Hardflip',
            'Inward Heelflip',
            '360 Flip',
            'Laser Flip',
            'Nollie Kickflip',
            'Nollie Heelflip',
            'Switch Kickflip',
            'Switch Heelflip',
        ],
    },
    [TRICK_TYPES.TRANSITION]: {
        [LEVELS.EASY]: [
            'Rock to Fakie',
            'BS Rock and Roll',
            'Fakie Rock',
            'Half Cab Rock',
            'Fakie Tail Stall',
            'BS 5-0 Stall',
            'BS Axle Stall',
            'FS Axle Stall',
            'BS Feeble Stall',
            'BS 5050 Grind',
        ],
        [LEVELS.MEDIUM]: [
            'BS Disaster',
            'FS Disaster',
            'FS Air',
            'BS Smith Stall',
            'FS 5050 Grind',
            'Fakie BS Crook',
            'Nose Stall',
            'Crook to Fakie',
            'FS Rock and Roll',
        ],
        [LEVELS.HARD]: [
            'FS Smith Stall',
            'FS 5-0 Stall',
            'BS Tail Stall',
            'Blunt to Fakie',
            'FS Feeble Stall',
            'Tail Stall Revert'
        ]
    },
    [TRICK_TYPES.LEDGE]: {
        [LEVELS.EASY]: [
            'FS 5050',
            'BS 5050',
            'FS 5-0',
            'BS Noseslide',
            'FS Noseslide',
        ],
        [LEVELS.MEDIUM]: [
            'BS Crook',
            'FS Crook',
            'FS Smith',
            'BS 5-0',
            'FS Tailslide'
        ],
        [LEVELS.HARD]: [
            'BS Smith',
            'BS Tailslide'
        ]
    }
}

export const GetTrick = (level, trickType) => {
    let tricksOfDifficulty = TRICKS[trickType][level];
    // Get random index
    let trickindex = Math.floor(Math.random() * tricksOfDifficulty.length);
    
    return tricksOfDifficulty[trickindex];
}

export const GetTrickTypePromptComponent = () => {
    return [
        {
            type: MessageComponentTypes.ACTION_ROW,
            components: [
                {
                type: MessageComponentTypes.BUTTON,
                custom_id: 'trick_type_flatground',
                label: 'Flatground',
                style: ButtonStyleTypes.PRIMARY
                },
                {
                type: MessageComponentTypes.BUTTON,
                custom_id: 'trick_type_ledge',
                label: 'Ledge',
                style: ButtonStyleTypes.PRIMARY
                },
                {
                type: MessageComponentTypes.BUTTON,
                custom_id: 'trick_type_transition',
                label: 'Transition',
                style: ButtonStyleTypes.PRIMARY
                }
            ]
        }
    ];
}

export const GetTrickResultComponent = () => {
    return [{
        type: MessageComponentTypes.ACTION_ROW,
        components: [
            {
                type: MessageComponentTypes.BUTTON,
                style: ButtonStyleTypes.SUCCESS,
                custom_id: 'trick_result_success',
                label: 'Yes'
            },
            {
                type: MessageComponentTypes.BUTTON,
                style: ButtonStyleTypes.DANGER,
                custom_id: 'trick_result_fail',
                label: 'No'
            }
        ]
    }];
}

export const GetLetters = (numberOfLetters) => {
    if (numberOfLetters === 0) {
        return "";
    }

    const word = "SKATE";
    return word.substring(0, numberOfLetters);
}

// Returns the difficulty 
export const GetDifficulty = (points) => {
    const pointsPerLevel = process.env.POINTS_PER_LEVEL;
    return Math.min(Math.floor(points / pointsPerLevel)+1, LEVELS.HARD);
} 