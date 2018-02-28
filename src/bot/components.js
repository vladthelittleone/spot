const bot = require("./index");
const Markup = require("telegraf/markup");
const message = require("./message");
const lodash = require("lodash");

class Components {
  static sendLocation (chatId, location) {
    const {latitude, longitude} = location;
    return bot.telegram.sendLocation(chatId, latitude, longitude);
  }

  static sendMatch (ctx, spot) {
    if (spot.location) {
      this.sendLocation(ctx.chat.id, spot.location)
          .then(() => this.sendSpotInfo(ctx, spot));
    } else {
      this.sendSpotInfo(ctx, spot);
    }
  }

  static sendSpotInfo (ctx, spot) {
    ctx.reply(
      message.SPOT_INFO(spot),
      Markup.inlineKeyboard([Markup.callbackButton("Добавиться", `add ${spot.hash}`)])
            .extra()
    );
  }

  static chooseMainAction (ctx) {
    ctx.reply("Выберите действие", Markup.keyboard([
      [message.OPEN_SPOTS],
      [message.CREATE_SPOT],
      [message.CURRENT_SPOT],
      [message.REMOVE_ACTIVE_SPOT]
    ]).resize().extra());
  }

  static chooseSpotType (ctx, sportTypes) {
    const keyboard = lodash.map(sportTypes, (s) => Markup.callbackButton(s, s));
    ctx.reply(
      "Введите тип спортивного матча.",
      Markup.inlineKeyboard(keyboard).extra()
    );
  }
}

module.exports = Components;
