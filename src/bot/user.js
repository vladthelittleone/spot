/**
 * Здесь выполняем логику связанную с пользователем.
 */

const Stage = require("telegraf/stage");
const WizardScene = require("telegraf/scenes/wizard");
const Components = require("./components");
const Markup = require("telegraf/markup");
const SpotModel = require("../models/spot");
const config = require("../config");
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

  bot.hears(message.OPEN_SPOTS, (ctx) => {
    SpotModel.getOpenSpots().then((spots) => {
      for (const spot of spots) {
        Components.replyMatch(ctx, spot);
      }
    });
  });

  bot.hears(message.CREATE_SPOT, (ctx) => ctx.scene.enter("create"));
};

function createScene () {

  return new WizardScene(
    "create",

    /**
     * Выбор типа матча.
     */
    (ctx) => {
      const fromID = ctx.from.id;
      spots[ctx.from.id] = {fromID}; // инициализируем новый spot
      keyboard.chooseSpotType(ctx, sportTypes);
      return ctx.wizard.next();
    },

    /**
     * Выбор времени проведения матча.
     */
    (ctx) => {

      const replyError = (ctx) => {
        ctx.reply(message.USER_ERROR_MSG);
        keyboard.chooseSpotType(ctx, sportTypes);
      };

      const sportType = ctx.callbackQuery && ctx.callbackQuery.data;
      if (sportType && lodash.includes(sportTypes, sportType)) {
        spots[ctx.from.id].sportType = ctx.callbackQuery.data;
        ctx.replyWithMarkdown(message.INSERT_SPOT_DATE);
        return ctx.wizard.next();
      } else {
        replyError(ctx);
      }
    },

    /**
     * Выбор места проведения матча.
     */
    (ctx) => {
      const time = moment(ctx.message.text, "DD.MM.YY H:m").toISOString();
      if (time) {
        spots[ctx.from.id].spotTime = time;
        ctx.reply(message.INSERT_SPOT_LOCATION);
        return ctx.wizard.next();
      } else {
        ctx.reply(message.USER_ERROR_MSG);
        ctx.replyWithMarkdown("Формат: *ДД.ММ.ГГ Ч:m*");
      }
    },

    /**
     * Ввод цены за человека.
     */
    (ctx) => {
      spots[ctx.from.id].location = ctx.message.text;
      ctx.reply(message.INSERT_SPOT_COST);
      return ctx.wizard.next();
    },

    /**
     * Выбор количества человек.
     */
    (ctx) => {
      spots[ctx.from.id].price = ctx.message.text;
      ctx.reply(message.INSERT_SPOT_MEMBERS);
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
        ctx.reply(message.INSERT_SPOT_PAYMENT_INFO);
        return ctx.wizard.next();
      } else {
        ctx.reply(message.USER_ERROR_MSG);
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
        ctx.reply(message.USER_ERROR_MSG);
      }
    }
  );
}

