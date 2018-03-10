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

if (process.env.NODE_ENV === 'dev') {
  bot.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    logger.info(`message: [ ${ctx.update.message.text} ] response time [ ${ms}ms ]`);
  });
}

// import here because component.js import 'index.js'
const Components = require("./components");
bot.start((ctx) => {
  Components.mainKeyboard(ctx);
});

require("./group")(bot);
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
