/**
 * Здесь выполняем логику связанную с пользователем.
 */

const Stage = require("telegraf/stage");
const WizardScene = require("telegraf/scenes/wizard");
const Components = require("./components");
const Markup = require("telegraf/markup");
const SpotModel = require("../models/spot");
const config = require("../config");
const logger = require("../utils/log")(module);
const session = require("telegraf/session");
const lodash = require("lodash");
const moment = require("moment");

const spots = {};
const sportTypes = config.get("sportTypes");

module.exports = (bot) => {

  // Сцена создания нового матча.
  const create = createScene();

  // Create scene manager
  const stage = new Stage();

  // Scene registration
  stage.register(create);

  bot.use(session());
  bot.use(stage.middleware());

  bot.action("spots", (ctx) => {
    SpotModel.getOpenSpots().then((spots) => {
      ctx.replyWithMarkdown("*=> Список доступных матчей*").then(() => {
        for (const spot of spots) {
          Components.replyMatch(ctx, spot);
        }
      });
    });
  });

  bot.action("create", (ctx) => ctx.scene.enter("create"));
};

function createScene () {
  return new WizardScene(
    "create",

    /**
     * Выбор типа матча.
     */
    (ctx) => {
      ctx.replyWithMarkdown("*=> Создать новый матч*").then(() => {
        const fromId = ctx.from.id;
        const keyboard = lodash.map(sportTypes, (s) => Markup.callbackButton(s, s));
        spots[fromId] = {fromId}; // Инициализируем spot
        ctx.reply(
          "Введите тип спортвного матча.",
          Markup.inlineKeyboard(keyboard).extra()
        );
        ctx.wizard.next();
      });
    },

    /**
     * Выбор времени проведения матча.
     */
    (ctx) => {
      const sportType = ctx.callbackQuery.data;
      if (lodash.includes(sportTypes, sportType)) {
        spots[ctx.from.id].sportType = ctx.callbackQuery.data;
        ctx.reply("Введите дату проведения матча");
        return ctx.wizard.next();
      } else {
        ctx.reply("Что-то пошло не так, попробуйте еще раз!");
      }
    },

    /**
     * Выбор места проведения матча.
     */
    (ctx) => {
      spots[ctx.from.id].spotTime = ctx.message.text;
      ctx.reply("Введите место проведения матча");
      return ctx.wizard.next();
    },

    /**
     * Ввод цены за человека.
     */
    (ctx) => {
      spots[ctx.from.id].location = ctx.message.text;
      ctx.reply("Введите цену за одного человека");
      return ctx.wizard.next();
    },

    /**
     * Выбор количества человек.
     */
    (ctx) => {
      spots[ctx.from.id].price = ctx.message.text;
      ctx.reply("Введите количество человек");
      return ctx.wizard.next();
    },

    /**
     * Ввод информации по оплате.
     */
    (ctx) => {
      const {text} = ctx.message;
      const count = Number.parseInt(text, 10);
      if (!isNaN(count)) {
        spots[ctx.from.id].count = count;
        ctx.reply("Введите доп. информацию по оплате");
        return ctx.wizard.next();
      } else {
        ctx.reply("Что-то пошло не так, попробуйте еще раз!");
      }
    },

    /**
     * Создание матча.
     */
    async (ctx) => {
      const {id} = ctx.from;
      spots[id].hash = id ^ moment();
      spots[id].paymentInfo = ctx.message.text;
      try {
        await SpotModel.create(spots[id]);
        ctx.reply(
          "Матч успешно создан! Выберите группу для информирования о матче.",
          Markup.inlineKeyboard([
            Markup.urlButton(
              "Выбрать группу",
              `https://telegram.me/SpotBBot?startgroup=${spots[id].hash}`
            )
          ]).extra()
        );
        delete spots[id]; // Удаляем информацию из "типа кэша".
        return ctx.scene.leave();
      } catch (e) {
        logger.error("Can't create group, cause of:", e);
        ctx.reply("Что-то пошло не так, попробуйте еще раз!");
      }
    }
  );
}

