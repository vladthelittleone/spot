const bot = require("./index");
const Markup = require("telegraf/markup");
const message = require("./message");
const lodash = require("lodash");

class Components {
  static sendLocation (chatId, location) {
    const {latitude, longitude} = location;
    return chatId && bot.telegram.sendLocation(chatId, latitude, longitude);
  }

  static sendMatch (ctx, spot) {
    if (!spot) return ctx.replyWithMarkdown(message.GROUP_DONT_HAVE_ACTIVE_SPOT);

    if (spot.location) {
      this.sendLocation(ctx.chat.id, spot.location)
          .then(() => this.sendSpotInfo(ctx, spot));
    } else {
      this.sendSpotInfo(ctx, spot);
    }
  }

  static sendSpotInfo (ctx, spot) {
    ctx.replyWithMarkdown(
      message.SPOT_INFO(spot),
      Markup.inlineKeyboard([Markup.callbackButton("Добавиться", `add ${spot.hash}`)])
            .extra()
    );
  }

  static cancelSceneKeyboard (ctx) {
    ctx.reply("Вы можете отменить создание матча на клавиатуре", Markup.keyboard([
      [message.CANCEL]
    ]));
  }

  static mainKeyboard (ctx) {
    ctx.reply("Выберите действие", Markup.keyboard([
      [message.OPEN_SPOTS],
      [message.CREATE_SPOT],
      [message.CURRENT_SPOT],
      [message.REMOVE_ACTIVE_SPOT]
    ]).resize().extra());
  }

  static sportTypesKeyboard (ctx, sportTypes) {
    const keyboard = lodash.map(sportTypes, (s) => Markup.callbackButton(s, s));
    ctx.reply(
      "Введите тип спортивного матча.",
      Markup.inlineKeyboard(keyboard).extra()
    );
  }
}

module.exports = Components;
