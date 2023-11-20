import 'dotenv/config';
import { InstallCommands } from './utils.js';

const SKATE_DICE = {
    name:  'skatedice',
    description: 'Skate Dice',
    type: 1, // Chat input
    options: [{
        type: 3,
        name: 'command',
        description: 'Command - New Game, Status',
        required: false,
        choices: [
            {
                name: 'New Game', // TODO JSA - Implement
                value: 'newgame'
            },
            {
                name: "Status", // TODO JSA - Implement
                value: 'status'
            }
        ]
    }]
}

const ALL_COMMANDS = [SKATE_DICE];

InstallCommands(process.env.APP_ID, ALL_COMMANDS);