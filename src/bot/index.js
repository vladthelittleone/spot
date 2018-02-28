const Telegraf = require("telegraf");
const config = require("../config");
const logger = require("../utils/log")(module);

const bot = new Telegraf(config.get("telegram:token"));
// export here because component.js import 'index.js'
module.exports = bot;

// import here because component.js import 'index.js'
const Components = require("./components");
bot.start((ctx) => {
  Components.chooseMainAction(ctx);
});

require("./spot")(bot);
require("./user")(bot);

bot.startPolling();

logger.info("bot start polling updates");
