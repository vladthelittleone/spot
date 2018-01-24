/**
 * Здесь выполняем логику связанную с пользователем.
 */

const Stage = require("telegraf/stage");
const WizardScene = require("telegraf/scenes/wizard");
const Components = require("./components");
const Markup = require("telegraf/markup");
const SpotAPI = require("../api");
const config = require("../config");
const logger = require("../utils/log")(module);
const session = require("telegraf/session");
const lodash = require("lodash");
const message = require("./message");
const moment = require("moment");
const keyboard = require("./keyboard");

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
    SpotAPI.getOpenSpots().then((spots) => {
      ctx.replyWithMarkdown("*=> Список доступных матчей*").then(() => {
        for (const spot of spots) {
          Components.replyMatch(ctx, spot);
        }
      });
    });
  });

  bot.hears(message.CREATE, (ctx) => ctx.scene.enter("create"));
};

function createScene () {

  return new WizardScene(
    "create",

    /**
     * Выбор типа матча.
     */
    (ctx) => {
      ctx.replyWithMarkdown("*=> Создать новый матч*").then(() => {
        const fromID = ctx.from.id;
        spots[ctx.from.id] = {fromID}; // инициализируем новый spot
        keyboard.chooseSpotType(ctx, sportTypes);
        return ctx.wizard.next();
      });
    },

    /**
     * Выбор времени проведения матча.
     */
    (ctx) => {

      const replyError = (ctx) => {
        ctx.reply(message.USER_ERROR_MSG);
        keyboard.chooseSpotType(ctx, sportTypes);
      };

      const sportType = ctx.callbackQuery ? ctx.callbackQuery.data : null;
      if (sportType && lodash.includes(sportTypes, sportType)) {
        spots[ctx.from.id].sportType = ctx.callbackQuery.data;
        ctx.reply("Введите дату проведения матча");
        return ctx.wizard.next();
      } else {
        replyError(ctx);
        return ctx.wizard.back();
      }
    },

    /**
     * Выбор места проведения матча.
     */
    (ctx) => {
      spots[ctx.from.id].spotTime = moment(ctx.message.text, "DD.MM.YY H:m").toISOString();
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
      try {
        spots[ctx.from.id].count = Number.parseInt(ctx.message.text, 10);
        ctx.reply("Введите доп. информацию по оплате");
        return ctx.wizard.next();
      } catch (e) {
        ctx.reply(message.USER_ERROR_MSG);
        return ctx.wizard.back();
      }
    },

    /**
     * Создание матча.
     */
    (ctx) => {
      const {id} = ctx.from;

      spots[id].hash = id ^ moment();
      spots[id].paymentInfo = ctx.message.text;

      try {
        SpotAPI.createSpot(spots[id]);

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
        ctx.reply(message.USER_ERROR_MSG);
        return ctx.wizard.back();
      }
    }
  );
}

