import 'dotenv/config';
import express from 'express';

// TODO JSA - remove unused imports
import { VerifyDiscordRequest, DiscordRequest } from './utils.js';

import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';

import {
  GetTrick,
  GetTrickTypePromptComponent,
  GetTrickResultComponent,
  GetLetters,
  LEVELS,
  GAME_STATES,
  LEVEL_NAMES,
} from './skatedice.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

let gameState = {};

app.post('/interactions', async function (req, res) {
  // Read info from body
  const { type, id, member, data } = req.body;
  let userId = null;
  if (member !== undefined) {
    userId = member.user.id;
  }
  
  console.log("user id: "+userId);

  // Get the game state.
  if (gameState[userId] === undefined) {
    console.log('creating new game state for user '+userId);
    gameState[userId] = {
      state: GAME_STATES.NEW_GAME,
      points: 0,
      letters: 0,
      currentTrick: "",
    };
  }
  let playerGameState = gameState[userId];

  // Respond to pings for verifications
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  console.log('received request');
  console.log(data);

  // Handles all "/command" commands.
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name, options } = data;

    if (name === "test") {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Test command received!",
        },
      });
    }

    if (name === 'skatedice') {
      console.log('skatedice command received');
      console.log('player game state', playerGameState);

      if (playerGameState.state === GAME_STATES.NEW_GAME || playerGameState.state === GAME_STATES.AWAITING_TRICK_TYPE) {
        playerGameState.state = GAME_STATES.AWAITING_TRICK_TYPE;
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Starting a new game of SKATE! Please select a trick type.",
            components: GetTrickTypePromptComponent()
          }
        });
      }

      if (playerGameState.state === GAME_STATES.AWAITING_TRICK_RESULT) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Your trick is "+playerGameState.currentTrick+"\nDid you land the trick?",
            components: GetTrickResultComponent()
          },
        });
      }

      console.log('unknown player game state: '+playerGameState.state);
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Error: unknown player game state.",
        },
      });
    }

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "Error: unknown command received.",
      },
    });
  }

  // Handling responses
  if (type === InteractionType.MESSAGE_COMPONENT) {
    console.log("got interaction type", data);
    const componentId = data.custom_id;
    const deleteEndpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;

    // Hanlding trick type selection
    if (componentId.startsWith('trick_type_')) {
      // We need to delete the trick type prompt once the user has responded to it
      const trickType = componentId.replace('trick_type_', '');

      const pointsPerLevel = process.env.POINTS_PER_LEVEL;
      let currentDifficulty = Math.min(Math.floor(playerGameState.points / pointsPerLevel)+1, LEVELS.HARD);

      // Get the random trick
      let trick = GetTrick(currentDifficulty, trickType);
      playerGameState.currentTrick = trick;
      playerGameState.state = GAME_STATES.TRICK_TYPE_SELECTED;
      try {
        // Send the trick
        await res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Your trick is: "+trick+".\n"+"Did you land it?\nYou can also use the /skatedice command later to respond.",
            components: GetTrickResultComponent()
          },
        });

        // Delete the trick prompt message.
        await DiscordRequest(deleteEndpoint, { method: "DELETE" });
      } catch (err) {
        console.error('Error sending trick type selection response.');
      }
      return;
    }

    // Trick Landed/Missed prompt result - handle success/failure here
    if (componentId.startsWith('trick_result_')) {
      console.log('got trick result prompt');
      playerGameState.state = GAME_STATES.AWAITING_TRICK_TYPE; // We now need to prompt for a new trick type
      if (componentId === 'trick_result_success') { // Handle trick success
        // Keep track of the players current difficulty vs the new one after points are awarded. Lets up show level up message.
        const pointsPerLevel = process.env.POINTS_PER_LEVEL;
        let oldDifficulty = Math.min(Math.floor(playerGameState.points / pointsPerLevel)+1, LEVELS.HARD);

        // Award points and start a new trick
        playerGameState.points += 1;
        let newDifficulty = Math.min(Math.floor(playerGameState.points / pointsPerLevel)+1, LEVELS.HARD);

        // Build prompt message.
        let promptContent = "You landed the trick! You now have "+playerGameState.points+" points.";
        if (oldDifficulty !== newDifficulty) {
          // Add level up message if the player is a t a new difficulty.
          promptContent += "\nYou levelled up! You are now at level "+LEVEL_NAMES[newDifficulty]+".";
        }
        promptContent += "\nSelect a new trick.";

        res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: promptContent,
            components: GetTrickTypePromptComponent(),
          }
        });
      } else { // Handle trick failure
        // Give a letter
        playerGameState.letters += 1;

        // If you have 5 letters the game is over.
        if (playerGameState.letters >= 5) {
          playerGameState.state = 'newgame';
          let gamePoints = playerGameState.points;
          playerGameState.points = 0; // Set points to zero since the game is over
          res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "You have SKATE. Game over\n You scored "+gamePoints+" points.",
            }
          });
        } else {
          // Otherwise, just prompt for a new trick
          playerGameState.state = 'awaitingtricktype';
          let letters = GetLetters(playerGameState.letters);
          res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "You missed the trick! You now have: '"+letters+"'.\nSelect a new trick.",
              components: GetTrickTypePromptComponent(),
            }
          });
        }   
      }

      // Delete the prompt message
      await DiscordRequest(deleteEndpoint, { method: "DELETE" });
      return;
    }
  }

  // Last ditch response in case we didn't expect the message.
  console.log("Unexpected interaction type: "+type);
  console.log(type === InteractionType.MESSAGE_COMPONENT);
  return res.send({
    type:InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: "Error: unexpected interaction type."
    }
  });
});