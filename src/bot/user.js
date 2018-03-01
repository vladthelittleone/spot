/**
 * Здесь выполняем логику связанную с пользователем.
 */

const Stage = require("telegraf/stage");
const WizardScene = require("telegraf/scenes/wizard");
const Components = require("./components");
const Markup = require("telegraf/markup");
const SpotModel = require("../models/spot");
const {SPOT_TYPES} = require('./types');
const session = require("telegraf/session");
const lodash = require("lodash");
const message = require("./message");
const moment = require("moment");

const spots = {};

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
    if (spot.fromId === from.id && spot.players.length === 1) {
      await SpotModel.removeSpot(spot.hash);
      ctx.reply(message.MATCH_REMOVE_SUCCESS);
      bot.telegram.sendMessage(spot.groupId, "Текущий матч был удален");
      return;
    }

    const updated = await SpotModel.removePlayer(spot.hash, from);

    ctx.reply(message.PLAYER_REMOVE_SUCCESS);

    if (updated.fromId === from.id) {
      const randomPlayer = updated.players[0];
      await SpotModel.updateSpotFromId(updated.fromId, randomPlayer.id);
    }

    let str = '';
    str += `${from.first_name} ${from.last_name} вышел из матча.\n`;
    str += `👎 ${updated.players.length} / ${updated.count}`;

    bot.telegram.sendMessage(updated.groupId, str);
  });

  bot.hears(message.OPEN_SPOTS, (ctx) => {
    SpotModel.getOpenSpots().then((spots) => {
      if (!spots.length) {
        ctx.reply(message.NO_ACTIVE_SPOTS);
      }
      for (const spot of spots) {
        Components.sendMatch(ctx, spot);
      }
    });
  });

  bot.hears(message.CREATE_SPOT, async (ctx) => {
    const spot = await SpotModel.getByFromId(ctx.from.id);
    if (!spot) {
      ctx.scene.enter("create");
    } else {
      ctx.reply(message.SPOT_ALREADY_CREATED);
      Components.sendMatch(ctx, spot);
    }
  });

  bot.hears(message.CURRENT_SPOT, async (ctx) => {
    const {from} = ctx;
    const spot = await SpotModel.getCurrentSpot(from.id);
    if (spot) {
      Components.sendMatch(ctx, spot);
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
      const fromId = ctx.from.id;
      spots[ctx.from.id] = {fromId}; // инициализируем новый spot
      Components.chooseSpotType(ctx, SPOT_TYPES);
      return ctx.wizard.next();
    },

    /**
     * Выбор времени проведения матча.
     */
    (ctx) => {
      const replyError = (ctx) => {
        ctx.reply(message.USER_ERROR_MSG);
        Components.chooseSpotType(ctx, SPOT_TYPES);
      };

      const type = ctx.callbackQuery && ctx.callbackQuery.data;
      if (type && lodash.includes(SPOT_TYPES, type)) {
        spots[ctx.from.id].spotType = ctx.callbackQuery.data;
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
        if (moment(time, moment.ISO_8601).diff(moment(), "hours") < 0) {
          ctx.reply(message.CANNOT_USE_PAST_TIME);
        } else {
          spots[ctx.from.id].spotTime = time;
          ctx.replyWithMarkdown(message.INSERT_SPOT_LOCATION);
          return ctx.wizard.next();
        }
      } else {
        ctx.replyWithMarkdown("Неверный формат! Используйте следующий: *ДД.ММ.ГГ Ч:m*");
      }
    },

    /**
     * Ввод цены за человека.
     */
    (ctx) => {
      if (ctx.message.location) {
        spots[ctx.from.id].location = ctx.message.location;
      } else {
        spots[ctx.from.id].locationText = ctx.message.text;
      }
      ctx.reply(message.INSERT_SPOT_COST);
      return ctx.wizard.next();
    },

    /**
     * Выбор количества человек.
     */
    (ctx) => {
      const {text} = ctx.message;
      const cost = Number.parseInt(text, 10);
      if (!isNaN(cost)) {
        spots[ctx.from.id].price = ctx.message.text;
        ctx.reply(message.INSERT_SPOT_MEMBERS);
        return ctx.wizard.next();
      } else {
        ctx.reply(message.USER_ERROR_MSG);
      }
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
