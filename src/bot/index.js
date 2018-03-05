const Telegraf = require("telegraf");
const config = require("../config");
const logger = require("../utils/log")(module);
const ip = require('../utils/ip');

const token = config.get("telegram:token");

const bot = new Telegraf(token);
// export here because component.js import 'index.js'
module.exports = bot;

bot.catch((error) => {
  logger.error(`telegraf error: ${error}`);
});

// import here because component.js import 'index.js'
const Components = require("./components");
bot.start((ctx) => {
  Components.chooseMainAction(ctx);
});

require("./spot")(bot);
require("./user")(bot);

if (process.env.NODE_ENV === 'pro') {
  bot.telegram.setWebhook(`${ip.getExternalIp()}/${token}`);
  bot.startWebhook(`/${token}`, null, 8080);
  logger.info("production start: bot starting hears updates from webhook");
} else {
  bot.telegram.deleteWebhook().then(() => {
    bot.startPolling();
    logger.info("development start: bot starting polling updates");
  });
}
