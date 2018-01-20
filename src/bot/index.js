/**
 * @since 20.01.2018
 * @author Skurishin Vladislav
 */
const Telegraf = require("telegraf");
const config = require("../config");

const bot = new Telegraf(config.get("telegram:token"));

require("./spot")(bot);
require("./user")(bot);

bot.startPolling();

module.exports = bot;
