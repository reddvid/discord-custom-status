const request = require("request");
const config = require("./config.json");
const monitor = require("./active-window");
const URL = `https://discord.com/api/v10/users/@me/settings`;

let previousApp;

callback = function (window) {
  try {
    console.log(`App: ${window.app}`);
    console.log(`Title: ${window.title}`);
    if (window.app != previousApp) {
      previousApp = window.app;
      updateStatus(window.app);
    } else if (window.app == "") {
      previousApp = window.title;
      updateStatus(window.title);
    }
  } catch (err) {
    console.log(`Callback error: ${err}`);
  }
};

//Get the current active window
monitor.getActiveWindow(callback, -1, config.interval); // (callback, # of requests (-1 inf), interval in seconds)

/* Update Status */
function updateStatus(appName) {
  return new Promise((resolve, reject) => {
    request(
      {
        method: "PATCH",
        uri: URL,
        headers: {
          Authorization: config.token,
        },
        json: {
          custom_status: {
            text: `${config.activityName} ${appName}`,
            emoji_name: config.emojiName,
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
        console.log("Updated status");
      }
    );
  });
}
