const Telegraf = require("telegraf");
const config = require("../config");
const utils = require("../utils");

const logger = utils.logger(module);
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
    const text = !!ctx.update.message;
    text && logger.info(`message: [ ${ctx.update.message.text} ] response time [ ${ms}ms ]`);
  });
}

// import here because component.js import 'index.js'
const Components = require("./components");
bot.start((ctx) => {
  Components.mainKeyboard(ctx);
});

require("./group")(bot);
require("./user")(bot);

bot.startPolling();
logger.info("development start: bot starting polling updates");
