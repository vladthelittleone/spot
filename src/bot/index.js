const Telegraf = require("telegraf");
const config = require("../config");
const Components = require("./components");
const logger = require("../utils/log")(module);

const bot = new Telegraf(config.get("telegram:token"));

bot.start((ctx) => {
  Components.chooseMainAction(ctx);
});

require("./spot")(bot);
require("./user")(bot);

bot.startPolling();

logger.info("bot start polling updates");

module.exports = bot;
