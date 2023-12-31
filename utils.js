import 'dotenv/config';
import fetch from 'node-fetch';
import { verifyKey } from 'discord-interactions';


/**
 * Verifies request signatures for bot.
 * Copied from discord bot documentation.
 */
export function VerifyDiscordRequest(clientKey) {
    return function (req, res, buf, encoding) {
      const signature = req.get('X-Signature-Ed25519');
      const timestamp = req.get('X-Signature-Timestamp');
  
      const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
      if (!isValidRequest) {
        res.status(401).send('Bad request signature');
        throw new Error('Bad request signature');
      }
    };
  }

/**
 * Copied from discord bot documentation
 */
export async function DiscordRequest(endpoint, options) {
    // append endpoint to root API URL
    const url = 'https://discord.com/api/v10/' + endpoint;
    // Stringify payloads
    if (options.body) options.body = JSON.stringify(options.body);
    // Use node-fetch to make requests
    const res = await fetch(url, {
      headers: {
        Authorization: `Bot ${process.env.BOT_TOKEN}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'User-Agent': 'mullenbot (https://github.com/jonathanargo/mullenbot, 1.0.0)',
      },
      ...options
    });
    // throw API errors
    if (!res.ok) {
      const data = await res.json();
      console.log(res.status);
      throw new Error(JSON.stringify(data));
    }
    // return original response
    return res;
  }

/**
 * Installs all slash commands.
 * Copied from discord bot documentation.
 */
export async function InstallCommands(appId, commands) {
    const endpoint = `applications/${appId}/commands`;
    try {
        await DiscordRequest(endpoint, { method: 'PUT', body: commands });
    } catch (err) {
        console.error(err);
    }
}