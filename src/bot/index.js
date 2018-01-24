const Telegraf = require("telegraf");
const config = require("../config");
const Markup = require("telegraf/markup");

const bot = new Telegraf(config.get("telegram:token"));

bot.start((ctx) => {
  ctx.reply("Выберите действие", Markup.inlineKeyboard([
    Markup.callbackButton("Список доступных матчей", "spots"),
    Markup.callbackButton("Создать новый матч", "create")
  ]).extra());
});

require("./spot")(bot);
require("./user")(bot);

bot.startPolling();

module.exports = bot;
