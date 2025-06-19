const request = require('request');
const config = require('./config.json');
const monitor = require('./active-window');
const URL = `https://discord.com/api/v10/users/@me/settings`;

let previousApp;
let previousTitle;
let customStatus;
let customEmoji;

const args = process.argv.slice(2);

switch (args) {
  default: // (callback, # of requests (-1 inf), interval in seconds)
    callback = function (window) {
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
