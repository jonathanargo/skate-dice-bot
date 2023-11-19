import 'dotenv/config';
import { InstallCommands } from './utils.js';

const TEST_COMMAND = {
    name: 'test',
    description: 'test command',
    type: 1, // Chat input
    options: [{
        type: 4,
        name: 'testoption',
        description: ' test',
        required: true,
        choices: [
            {
                name: 'testchoice1',
                value: 1
            },
            {
                name: 'testchoice2',
                value: 2
            }
        ]
    }]
};

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

const ALL_COMMANDS = [TEST_COMMAND, SKATE_DICE];

InstallCommands(process.env.APP_ID, ALL_COMMANDS);