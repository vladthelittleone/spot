/**
 * @since 24.01.2018
 * @author Skurishin Vladislav
 */

const Markup = require("telegraf/markup");
const message = require("./message");
const lodash = require("lodash");

class Components {
  static showMatch (ctx, spot) {
    ctx.reply(
      message.SPOT_INFO(spot),
      Markup.inlineKeyboard([Markup.callbackButton("Добавиться", `add ${spot.hash}`)]).extra()
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
      "Введите тип спортвного матча.",
      Markup.inlineKeyboard(keyboard).extra()
    );
  }
}

module.exports = Components;
