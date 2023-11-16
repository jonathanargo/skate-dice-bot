import 'dotenv/config';
import express from 'express';

// TODO JSA - remove unused imports
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest, DiscordRequest } from './utils.js';
import { GetTrick } from './skatedice.js';

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
      letters: 0
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

      if (playerGameState.state === 'newgame') {
        playerGameState.state = 'awaitingtricktype';
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Starting a new game of SKATE! Please select a trick type.",
            // TODO JSA - Might need ephemeral here
            components: [
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
            ]
          }
        });
      }

      // TODO JSA - Change to enum
      if (playerGameState.state === 'awaitingtrickresult') {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Awaiting trick result.",
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

    // Hanlding trick type selection
    if (componentId.startsWith('trick_type_')) {
      // We need to delete the trick type prompt once the user has responded to it
      const deleteEndpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;
      const trickType = componentId.replace('trick_type_', '');

      // Get the random trick
      let trick = GetTrick('easy', trickType);
      playerGameState.state = 'awaitingtrickresult'; // TODO JSA - Change to enum
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Your trick is: "+trick+".\nNext, use the /skatedice command to report your result."
        },
      });
    }
  }
  // Last ditch response in case we didn't expect the message.
  console.log("Type: "+type);
  console.log(type === InteractionType.MESSAGE_COMPONENT);
  return res.send({
    type:InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: "Error: unexpected interaction type."
    }
  });
});