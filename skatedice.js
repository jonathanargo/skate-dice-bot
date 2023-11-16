import {
    MessageComponentTypes,
    ButtonStyleTypes,
  } from 'discord-interactions';

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

// TODO JSA - Implement these
export const GAME_STATES = {
    NEW_GAME: 'newgame',
    TRICK_TYPE_SELECTED: 'awaitingtricktype',
    TRICK_RESULT: 'awaitingtrickresult'
};

export const GAME_STATE_NAMES = {
    NEW_GAME: 'New Game',
    TRICK_TYPE_SELECTED: 'Waiting On Trick Type Selection',
    TRICK_RESULT: 'Waiting on Trick Result'
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
        ],
        [LEVELS.MEDIUM]: [],
        [LEVELS.HARD]: []
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