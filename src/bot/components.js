/**
 * @since 24.01.2018
 * @author Skurishin Vladislav
 */
const Markup = require("telegraf/markup");
const moment = require("moment");
const message = require("./message");
const lodash = require("lodash");

class Components {
  static showMatch (ctx, spot) {
    const {sportType, spotTime, location, price, count, players} = spot;
    let str = "";
    str += `Вид спорта: ${sportType}\n`;
    str += `Дата проведения: ${moment(spotTime).format("DD.MM.YY H:m")}\n`;
    str += `Место проведения: ${location}\n`;
    str += `Цена: ${price}\n`;
    str += `Необходимо: ${count} человек\n`;
    str += `Собрано: ${players.length} человек`;
    ctx.reply(
      str,
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
