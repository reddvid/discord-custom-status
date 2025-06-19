const request = require('request');
const config = require('./config.json');
const monitor = require('./active-window');
const URL = `https://discord.com/api/v10/users/@me/settings`;
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { Client, Intents, MessageEmbed, Collection } = require('discord.js');

let previousApp;
let previousTitle;
let customStatus;
let customEmoji;
let count = 0;
const args = process.argv.slice(2);

switch (args) {
  default: // (callback, # of requests (-1 inf), interval in seconds)
    callback = function (window) {
      count++;
      sendBerry();
      try {
        console.log(`App: ${window.app}`);
        console.log(`Title: ${window.title}`);
        if (
          (window.app != previousApp || window.title != previousTitle) &&
          !window.app.includes('Microsoft')
        ) {
          previousApp = window.app;
          previousTitle = window.title;
          updateStatus(window.app);
        } else if (window.app != previousApp || window.title != previousTitle) {
          previousApp = window.app;
          previousTitle = window.title;
          updateStatus(window.app);
        } else if (
          (window.app == '' || window.app.includes('Microsoft')) &&
          (window.app != previousApp || window.title != previousTitle)
        ) {
          previousTitle = window.title;
          previousApp = window.app;
          updateStatus(window.title);
        }
      } catch (err) {
        console.log(`Callback error: ${err}`);
      }
    };

    monitor.getActiveWindow(callback, -1, config.interval);
    break;

  case ('book', 'read', 'reading'):
    customStatus = 'Reading a physical book';
    customEmoji = '📖';
    updateStatus('custom');
}

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER', 'GUILD_MEMBER'],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  const CLIENT_ID = client.user.id;
  const rest = new REST({
    version: '10',
  }).setToken(config.token);
  (async () => {
    try {
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, config.guildId),
        {
          body: commands,
        }
      );
      console.log('Registered guild commands');
    } catch (err) {
      if (err) console.error(err);
    }
  })();
});

/* Update Status */
function updateStatus(appName) {
  return new Promise((resolve, reject) => {
    request(
      {
        method: 'PATCH',
        uri: URL,
        headers: {
          Authorization: config.token,
        },
        json: {
          custom_status: {
            text:
              appName === 'custom'
                ? customStatus
                : `${config.activityName} ${appName}`,
            emoji_name: appName === 'custom' ? customEmoji : config.emojiName,
          },
        },
      },
      (err, res) => {
        if (err) {
          return reject(`Request error: ${res.statusCode}`);
        }
        if (res.statusCode !== 200) {
          return reject(`Status code error: ${res.statusCode}`);
        }
        resolve(true);
        console.log('Updated status: ' + appName);
      }
    );
  }).catch((e) => console.log(e));
}

function sendBerry() {
  return new Promise((resolve, reject) => {
    request(
      {
        method: 'POST',
        uri: 'https://discord.com/api/v10/channels/1356669736254967902/messages',
        headers: {
          Authorization: config.token,
        },
        json: {
          channel: {
            text:
              appName === 'custom'
                ? customStatus
                : `${config.activityName} ${appName}`,
            emoji_name: appName === 'custom' ? customEmoji : config.emojiName,
          },
        },
      },
      (err, res) => {
        if (err) {
          return reject(`Request error: ${res.statusCode}`);
        }
        if (res.statusCode !== 200) {
          return reject(`Status code error: ${res.statusCode}`);
        }
        resolve(true);
        console.log('Updated status: ' + appName);
      }
    );
  }).catch((e) => console.log(e));
}
