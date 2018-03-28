const Stage = require("telegraf/stage");
const WizardScene = require("telegraf/scenes/wizard");
const Components = require("./components");
const Markup = require("telegraf/markup");
const models = require("../models");
const types = require('./types');
const session = require("telegraf/session");
const lodash = require("lodash");
const message = require("./message");
const moment = require("moment");

module.exports = (bot) => {

  // create scene about new spot
  const createSpotScene = newCreateSpotScene();
  // added command that cancel scene
  createSpotScene.hears(message.CANCEL, ctx => {
    ctx.scene.leave();
    Components.mainKeyboard(ctx);
  });

  // create scene about find spot  
  const findSpotScene = newFindSpotScene();
  findSpotScene.hears(message.CANCEL, ctx => {
    ctx.scene.leave();
    Components.mainKeyboard(ctx);
  });

  const globalFindScene = newGlobalFindScene();
  globalFindScene.hears(message.CANCEL, ctx => {
    ctx.scene.leave();
    Components.mainKeyboard(ctx);
  });

  // create scene manager
  const stage = new Stage();
  // scene registration
  stage.register(globalFindScene);
  stage.register(createSpotScene);
  stage.register(findSpotScene);

  bot.use(session());
  bot.use(stage.middleware());

  bot.hears(message.REMOVE_ACTIVE_SPOT, async (ctx) => {
    const {from} = ctx;

    const spot = await models.Spot.getCurrentSpot(from.id);
    if (!spot) {
      ctx.reply(message.NO_ACTIVE_SPOT);
      return;
    }

    if (spot.fromId === from.id && spot.players.length === 1) {
      await models.Spot.removeSpot(spot.hash);
      ctx.reply(message.MATCH_REMOVE_SUCCESS);
      spot.groupId && bot.telegram.sendMessage(
        spot.groupId,
        message.CURRENT_SPOT_HAS_BEEN_REMOVED
      );
      return;
    }

    const updated = await models.Spot.removePlayer(spot.hash, from);

    ctx.reply(message.PLAYER_REMOVE_SUCCESS);

    if (updated.fromId === from.id) {
      const randomPlayer = updated.players[0];
      await models.Spot.updateSpotFromId(updated.fromId, randomPlayer.id);
    }

    let str = '';
    str += `${message.PLAYER_INFO(from)} вышел из матча.\n`;
    str += `👎 ${updated.players.length} / ${updated.count}`;

    updated.groupId && bot.telegram.sendMessage(updated.groupId, str);
  });

  bot.hears(message.GLOBAL_FIND, ctx => ctx.scene.enter('global find'));

  bot.hears(message.FIND_SPOTS, ctx => ctx.scene.enter('find'));

  bot.hears(message.CANCEL, ctx => {
    Components.mainKeyboard(ctx);
  });

  bot.hears(message.CREATE_SPOT, async (ctx) => {
    const spot = await models.Spot.getByFromId(ctx.from.id);
    if (!spot) {
      ctx.scene.enter("create");
    } else {
      ctx.reply(message.SPOT_ALREADY_CREATED);
      await Components.sendMatch(ctx, spot);
    }
  });

  bot.hears(message.CURRENT_SPOT, async (ctx) => {
    const {from} = ctx;
    const spot = await models.Spot.getCurrentSpot(from.id);
    if (spot) {
      await Components.sendMatch(ctx, spot);
    } else {
      ctx.reply(message.NO_ACTIVE_SPOT);
    }
  });
};

function newGlobalFindScene() {
  return new WizardScene(
    'global find',

    async ctx => {
      await Components.cancelSceneKeyboard(ctx);
      await Components.sportTypesKeyboard(ctx);
      return ctx.wizard.next();
    },

    async ctx => {
      const sport = ctx.callbackQuery && ctx.callbackQuery.data;
      if (sport && lodash.includes(types.SPORT_TYPES, sport)) {
        const spots = await models.Spot.findBySport(sport);
        if (spots.length) {
          for (const spot of spots) {
            await Components.sendMatch(ctx, spot, true);
          }
        } else {
          ctx.replyWithMarkdown(`По ${sport} нет матчей`);
        }
        await Components.mainKeyboard(ctx);
        return ctx.scene.leave();
      } else {
        await ctx.reply(message.USER_ERROR_MSG);
        await Components.sportTypesKeyboard(ctx);
      }
    }
  );
}

function newFindSpotScene() {
  return new WizardScene(
    'find',

    async ctx => {
      await Components.cancelSceneKeyboard(ctx);
      await Components.sportTypesKeyboard(ctx);
      return ctx.wizard.next();
    },

    async ctx => {
      const sport = ctx.callbackQuery && ctx.callbackQuery.data;
      if (sport && lodash.includes(types.SPORT_TYPES, sport)) {
        ctx.scene.session.sport = sport;
        await Components.spbMetroTreesKeboard(ctx);
        return ctx.wizard.next();
      } else {
        await ctx.reply(message.USER_ERROR_MSG);
        await Components.sportTypesKeyboard(ctx);
      }
    },

    async ctx => {
      const tree = ctx.callbackQuery && ctx.callbackQuery.data;
      if (tree && lodash.includes(types.SPB_METRO_TREES, tree)) {
        ctx.scene.session.tree = tree;
        await Components.metroStationsKeyboard(ctx, tree);
        return ctx.wizard.next();
      } else {
        await ctx.reply(message.USER_ERROR_MSG);
        await Components.spbMetroTreesKeboard(ctx);
      }
    },

    async ctx => {
      const station = ctx.callbackQuery && ctx.callbackQuery.data;
      const {sport, tree} = ctx.scene.session;
      if (station && lodash.includes(types.SPB_METRO_STATIONS_BY_TREE[tree], station)) {
        const spots = await models.Spot.findByMetroAndSport(station, sport);
        if (spots.length) {
          for (const spot of spots) {
            await Components.sendMatch(ctx, spot, true);
          }
        } else {
          ctx.replyWithMarkdown(`На *${station}* нет ${sport} матчей`);
        }
        await Components.mainKeyboard(ctx);
        return ctx.scene.leave();
      } else {
        await ctx.reply(message.USER_ERROR_MSG);
        await Components.metroStationsKeyboard(ctx);
      }
    }
  );
}

function newCreateSpotScene() {
  return new WizardScene(
    "create",

    /**
     * initialize spot
     */
    (ctx) => {
      Components.cancelSceneKeyboard(ctx);
      Components.sportTypesKeyboard(ctx);
      ctx.scene.session.spot = {fromId: ctx.from.id};
      return ctx.wizard.next();
    },

    /**
     * choose spot type
     */
    async (ctx) => {
      const replyError = async (ctx) => {
        await ctx.reply(message.USER_ERROR_MSG);
        Components.sportTypesKeyboard(ctx);
      };

      const type = ctx.callbackQuery && ctx.callbackQuery.data;
      if (type && lodash.includes(types.SPORT_TYPES, type)) {
        ctx.scene.session.spot.sportType = type;
        ctx.replyWithMarkdown(message.INSERT_SPOT_DATE);
        return ctx.wizard.next();
      } else {
        await replyError(ctx);
      }
    },

    /**
     * insert spot time
     */
    async (ctx) => {
      const time = moment(ctx.message.text, "DD.MM.YY HH:mm", true);
      if (time.isValid()) {
        if (time.diff(moment()) < 0) {
          ctx.reply(message.CANNOT_USE_PAST_TIME);
        } else {
          ctx.scene.session.spot.spotTime = time.toISOString();
          await Components.spbMetroTreesKeboard(ctx);
          return ctx.wizard.next();
        }
      } else {
        ctx.replyWithMarkdown(message.INCORRECT_DATE_FORMAT);
      }
    },

    async ctx => {
      const tree = ctx.callbackQuery && ctx.callbackQuery.data;
      if (tree && lodash.includes(types.SPB_METRO_TREES, tree)) {
        ctx.scene.session.tree = tree;
        await Components.metroStationsKeyboard(ctx, tree);
        return ctx.wizard.next();
      } else {
        await ctx.reply(message.USER_ERROR_MSG);
        await Components.spbMetroTreesKeboard(ctx);
      }
    },

    /**
     * enter metro station
     */
    async ctx => {
      const station = ctx.callbackQuery && ctx.callbackQuery.data;
      const {tree} = ctx.scene.session;
      if (station && lodash.includes(types.SPB_METRO_STATIONS_BY_TREE[tree], station)) {
        ctx.scene.session.spot.metro = station;
        ctx.replyWithMarkdown(message.INSERT_SPOT_LOCATION);
        return ctx.wizard.next();
      } else {
        await ctx.reply(message.USER_ERROR_MSG);
        await Components.metroStationsKeyboard(ctx);
      }
    },

    /**
     * insert or upload location
     */
    async ctx => {
      if (ctx.message) {
        if (ctx.message.location) {
          ctx.scene.session.spot.location = ctx.message.location;
        } else {
          ctx.scene.session.spot.locationText = ctx.message.text;
        }
        ctx.reply(message.INSERT_SPOT_COST);
        return ctx.wizard.next();
      } else {
        await ctx.reply(message.USER_ERROR_MSG);
        ctx.replyWithMarkdown(message.INSERT_SPOT_LOCATION);
      }
    },

    /**
     * insert cost by one human
     */
    (ctx) => {
      const {text} = ctx.message;
      const cost = Number.parseInt(text, 10);
      if (!isNaN(cost)) {
        ctx.scene.session.spot.price = ctx.message.text;
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
        ctx.scene.session.spot.count = count;
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

      ctx.scene.session.spot.hash = id ^ moment();
      ctx.scene.session.spot.paymentInfo = ctx.message.text;

      const {spot} = ctx.scene.session;

      try {
        await models.Spot.create(spot);
        await models.Spot.addPlayer(spot.hash, from);
        ctx.reply(
          message.SPOT_HAS_BEEN_CREATEED,
          Markup.inlineKeyboard([
            Markup.urlButton(
              "Выбрать группу",
              `https://telegram.me/SpotBBot?startgroup=${spot.hash}`
            )
          ]).extra()
        );

        Components.mainKeyboard(ctx);
        return ctx.scene.leave();
      } catch (e) {
        ctx.reply(message.USER_ERROR_MSG);
      }
    }
  );
}
