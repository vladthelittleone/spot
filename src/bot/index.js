const Telegraf = require("telegraf");
const config = require("../config");
const keyboard = require('./keyboard');
const logger = require('../utils/log')(module);

const bot = new Telegraf(config.get("telegram:token"));

bot.start((ctx) => {
  keyboard.main(ctx);
});

require("./spot")(bot);
require("./user")(bot);

bot.startPolling();

logger.info('bot start polling updates');

module.exports = bot;
