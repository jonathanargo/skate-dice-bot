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
  GetLetters
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
      state: 'newgame',
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

      if (playerGameState.state === 'newgame' || playerGameState.state === 'awaitingtricktype') {
        playerGameState.state = 'awaitingtricktype';
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Starting a new game of SKATE! Please select a trick type.",
            components: GetTrickTypePromptComponent()
          }
        });
      }

      // TODO JSA - Change to enum
      if (playerGameState.state === 'awaitingtrickresult') {
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

      // Get the random trick
      // TODO JSA - I think this should give you the yes/no prompt instead of requiring you to 
      let trick = GetTrick('easy', trickType);
      playerGameState.currentTrick = trick;
      playerGameState.state = 'awaitingtrickresult'; // TODO JSA - Change to enum
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

    // Trick Landed/Missed prompt
    if (componentId.startsWith('trick_result_')) {
      // handle success and failure here
      console.log('got trick result prompt');
      playerGameState.state = 'awaitingtricktype';
      if (componentId === 'trick_result_success') { // Handle trick success
        // Award points and start a new trick
        playerGameState.points += 1;
        
        res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "You landed the trick! You now have "+playerGameState.points+" points.\nSelect a new trick.",
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
              content: "You have SKATE. Game over\n You scored "+playerGameState.points+" points.",
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