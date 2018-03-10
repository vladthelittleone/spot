/**
 * here execute logic with user
 */

const Stage = require("telegraf/stage");
const WizardScene = require("telegraf/scenes/wizard");
const Components = require("./components");
const Markup = require("telegraf/markup");
const SpotModel = require("../models/spot");
const {SPORT_TYPES} = require('./types');
const session = require("telegraf/session");
const lodash = require("lodash");
const message = require("./message");
const moment = require("moment");

const spots = {};

module.exports = (bot) => {

  // create scene about new spot
  const create = createScene();

  // added command that cancel scene
  create.hears(message.CANCEL, ctx => {
    ctx.scene.leave();
    delete spots[ctx.from.id]; // delete spot from cache
    Components.mainKeyboard(ctx);
  });

  // create scene manager
  const stage = new Stage();

  // scene registration
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
      spot.groupId &&
      bot.telegram.sendMessage(spot.groupId, message.CURRENT_SPOT_HAS_BEEN_REMOVED);
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

  bot.hears(message.OPEN_SPOTS, async (ctx) => {
    const spots = await SpotModel.getOpenSpots();
    if (!spots.length) {
      ctx.reply(message.NO_ACTIVE_SPOTS);
    } else {
      for (const spot of spots) {
        await Components.sendMatch(ctx, spot, false);
      }
    }
  });

  bot.hears(message.CANCEL, ctx => {
    Components.mainKeyboard(ctx);
  });

  bot.hears(message.CREATE_SPOT, async (ctx) => {
    const spot = await SpotModel.getByFromId(ctx.from.id);
    if (!spot) {
      ctx.scene.enter("create");
    } else {
      ctx.reply(message.SPOT_ALREADY_CREATED);
      await Components.sendMatch(ctx, spot);
    }
  });

  bot.hears(message.CURRENT_SPOT, async (ctx) => {
    const {from} = ctx;
    const spot = await SpotModel.getCurrentSpot(from.id);
    if (spot) {
      await Components.sendMatch(ctx, spot);
    } else {
      ctx.reply(message.NO_ACTIVE_SPOT);
    }
  });
};

function createScene () {
  return new WizardScene(
    "create",

    /**
     * initialize spot
     */
    (ctx) => {
      const fromId = ctx.from.id;
      spots[ctx.from.id] = {fromId}; // initialize new spot at cache
      Components.cancelSceneKeyboard(ctx);
      Components.sportTypesKeyboard(ctx, SPORT_TYPES);
      return ctx.wizard.next();
    },

    /**
     * choose spot type
     */
    async (ctx) => {
      const replyError = async (ctx) => {
        await ctx.reply(message.USER_ERROR_MSG);
        Components.sportTypesKeyboard(ctx, SPORT_TYPES);
      };

      const type = ctx.callbackQuery && ctx.callbackQuery.data;
      if (type && lodash.includes(SPORT_TYPES, type)) {
        spots[ctx.from.id].sportType = ctx.callbackQuery.data;
        ctx.replyWithMarkdown(message.INSERT_SPOT_DATE);
        return ctx.wizard.next();
      } else {
        await replyError(ctx);
      }
    },

    /**
     * insert spot time
     */
    (ctx) => {
      const time = moment(ctx.message.text, "DD.MM.YY HH:mm", true);
      if (time.isValid()) {
        if (time.diff(moment()) < 0) {
          ctx.reply(message.CANNOT_USE_PAST_TIME);
        } else {
          spots[ctx.from.id].spotTime = time.toISOString();
          ctx.replyWithMarkdown(message.INSERT_METRO_STATION);
          return ctx.wizard.next();
        }
      } else {
        ctx.replyWithMarkdown(message.INCORRECT_DATE_FORMAT);
      }
    },

    /**
     * enter metro station
     */
    (ctx) => {
      spots[ctx.from.id].metro = ctx.message.text;
      ctx.replyWithMarkdown(message.INSERT_SPOT_LOCATION);
      return ctx.wizard.next();
    },

    /**
     * insert or upload location
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
     * insert cost by one human
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
     * insert max human at spot
     */
    (ctx) => {
      const {text} = ctx.message;
      const count = Number.parseInt(text, 10);
      if (!isNaN(count) && count > 0) {
        spots[ctx.from.id].count = count;
        ctx.reply(message.INSERT_SPOT_PAYMENT_INFO);
        return ctx.wizard.next();
      } else if (count === 1) {
        ctx.reply(message.CANNOT_CREATE_SPOT_FOR_ONE);
      } else {
        ctx.reply(message.USER_ERROR_MSG);
      }
    },

    /**
     * insert payment info and create spot
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
          message.SPOT_HAS_BEEN_CREATEED,
          Markup.inlineKeyboard([
            Markup.urlButton(
              "Выбрать группу",
              `https://telegram.me/SpotBBot?startgroup=${spots[id].hash}`
            )
          ]).extra()
        );

        Components.mainKeyboard(ctx);
        delete spots[id]; // delete spot from cache
        return ctx.scene.leave();
      } catch (e) {
        ctx.reply(message.USER_ERROR_MSG);
      }
    }
  );
}
