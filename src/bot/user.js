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

  bot.hears(message.REMOVE_ACTIVE_SPOT, async (ctx) => {
    const {from} = ctx;

    const spot = await SpotModel.getCurrentSpot(from.id);
    if (!spot) {
      ctx.reply(message.NO_ACTIVE_SPOT);
      return;
    }
    if (spot.fromID === from.id && spot.players.length === 1) {
      await SpotModel.removeSpot(spot.hash);
      ctx.reply(message.MATCH_REMOVE_SUCCESS);
      bot.telegram.sendMessage(spot.groupID, "Текущий матч был удален");
      return;
    }

    await SpotModel.removePlayer(spot.hash, from);
    ctx.reply(message.PLAYER_REMOVE_SUCCESS);

    if (spot.fromID === from.id) {
      const randomPlayer = spot.players[0];
      await  SpotModel.updateSpotFromID(spot.fromID, randomPlayer.id);
    }

    let str = '';
    str += `${from.first_name} ${from.last_name} вышел из матча.\n`;
    str += `👎 ${spot.players.length - 1} / ${spot.count}`;

    bot.telegram.sendMessage(spot.groupID, str);
  });

  bot.hears(message.OPEN_SPOTS, (ctx) => {
    SpotModel.getOpenSpots().then((spots) => {
      if (!spots.length) {
        ctx.reply(message.NO_ACTIVE_SPOTS);
      }
      for (const spot of spots) {
        Components.showMatch(ctx, spot);
      }
    });
  });

  bot.hears(message.CREATE_SPOT, async (ctx) => {
    const spot = await SpotModel.getByFromID(ctx.from.id);
    if (!spot) {
      ctx.scene.enter("create");
    } else {
      ctx.reply(message.SPOT_ALREADY_CREATED);
      Components.showMatch(ctx, spot);
    }
  });

  bot.hears(message.CURRENT_SPOT, async (ctx) => {
    const {from} = ctx;
    const spot = await SpotModel.getCurrentSpot(from.id);
    if (spot) {
      Components.showMatch(ctx, spot);
    } else {
      ctx.reply(message.NO_ACTIVE_SPOT);
    }
  });
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
      Components.chooseSpotType(ctx, sportTypes);
      return ctx.wizard.next();
    },

    /**
     * Выбор времени проведения матча.
     */
    (ctx) => {

      const replyError = (ctx) => {
        ctx.reply(message.USER_ERROR_MSG);
        Components.chooseSpotType(ctx, sportTypes);
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
      const {from} = ctx;
      const {id} = from;

      spots[id].hash = id ^ moment();
      spots[id].paymentInfo = ctx.message.text;

      try {
        await SpotModel.create(spots[id]);
        await SpotModel.addPlayer(spots[id].hash, from);
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

