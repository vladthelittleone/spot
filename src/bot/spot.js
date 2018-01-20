/**
 * Здесь выполняем логику связанную с группой.
 *
 * @since 20.01.2018
 * @author Skurishin Vladislav
 */
const logger = require("../utils/log")(module);
const SpotAPI = require("../api");
const session = require("telegraf/session");
const Stage = require("telegraf/stage");
const Markup = require("telegraf/markup");
const WizardScene = require("telegraf/scenes/wizard");
const Composer = require('telegraf/composer');

module.exports = (bot) => {
  const groupSearch = new WizardScene(
    "groupSearch",
    (ctx) => {
      ctx.reply("Step 1", Markup.inlineKeyboard([
        Markup.urlButton("❤️", "http://telegraf.js.org"),
        Markup.callbackButton("Создать матч", "/create")
      ]).extra());
      return ctx.wizard.next();
    },
    (ctx) => {
      ctx.reply("Введите имя матча.");
      return ctx.wizard.next();
    },
    (ctx) => {
      try {
        SpotAPI.createSpot({
          fromId: ctx.from.id
        });
        ctx.reply("Матч успешно создан!");
      } catch (e) {
        logger.error("Can't create group, cause of:", e);
        ctx.reply("Что-то пошло не так, попробуйте еще раз!");
      }
    }
  );

  const stage = new Stage([groupSearch], {default: "groupSearch"});
  bot.use(session());
  bot.use(stage.middleware());
};
