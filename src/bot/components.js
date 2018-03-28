const bot = require("./bot");
const Markup = require("telegraf/markup");
const message = require("./message");
const lodash = require("lodash");
const types = require('./types');

class Components {
  static sendLocation(chatId, location) {
    const {latitude, longitude} = location;
    return chatId && bot.telegram.sendLocation(chatId, latitude, longitude);
  }

  static async sendMatch(ctx, spot, forFind = false) {
    if (!spot) return ctx.replyWithMarkdown(message.GROUP_DONT_HAVE_ACTIVE_SPOT);
    !forFind && spot.location && await this.sendLocation(ctx.chat.id, spot.location);
    return await this.sendSpotInfo(ctx, spot, forFind);
  }

  static sendPlayers(ctx, players) {
    return ctx.replyWithMarkdown(message.PLAYERS_LIST(players));
  }

  static sendSpotInfo(ctx, spot, forFind) {
    return ctx.replyWithMarkdown(
      message.SPOT_INFO(spot, forFind),
      Markup.inlineKeyboard([Markup.callbackButton("🤙🏻 Добавиться", `add ${spot.hash}`)])
        .extra()
    );
  }

  static cancelSceneKeyboard(ctx) {
    return ctx.reply("Вы можете отменить действие нажатием на крестик", Markup.keyboard([
      [message.CANCEL]
    ]).resize().extra());
  }

  static spbMetroTreesKeboard(ctx) {
    const keyboard = lodash.map(types.SPB_METRO_TREES, (t) => Markup.callbackButton(t, t));
    return ctx.reply(
      "Выберите ветку метро",
      Markup.inlineKeyboard(keyboard).extra()
    );
  }

  static metroStationsKeyboard(ctx, tree) {
    const keyboard = [];
    let accumulate = [];
    lodash.forEach(types.SPB_METRO_STATIONS_BY_TREE[tree], (station, index) => {
      if (index % 2 === 0) {
        accumulate = [];
        accumulate.push(Markup.callbackButton(station, station));
        keyboard.push(accumulate);
      } else {
        accumulate.push(Markup.callbackButton(station, station));
      }
    });

    return ctx.reply(
      "Выберите станцию метро",
      Markup.inlineKeyboard(keyboard).resize().extra()
    );
  }

  static mainKeyboard(ctx) {
    return ctx.reply("Выберите действие", Markup.keyboard([
      [message.FIND_SPOTS, message.CREATE_SPOT],
      [message.CURRENT_SPOT, message.GLOBAL_FIND, message.REMOVE_ACTIVE_SPOT],
    ]).resize().extra());
  }

  static sportTypesKeyboard(ctx) {
    const keyboard = lodash.map(types.SPORT_TYPES, (s) => Markup.callbackButton(s, s));
    return ctx.reply(
      "Введите тип матча",
      Markup.inlineKeyboard(keyboard).extra()
    );
  }
}

module.exports = Components;
