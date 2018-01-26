/**
 * @since 24.01.2018
 * @author Skurishin Vladislav
 */
const Markup = require("telegraf/markup");
const moment = require("moment");

class Components {
  static replyMatch (ctx, spot) {
    const {sportType, spotTime, location, price, count} = spot;
    let str = "";
    str += `Вид спорта: ${sportType}\n`;
    str += `Дата проведения: ${moment(spotTime).format("DD.MM.YY H:m")}\n`;
    str += `Место проведения: ${location}\n`;
    str += `Цена: ${price}\n`;
    str += `Необходимо: ${count} человек`;
    ctx.reply(
      str,
      Markup.inlineKeyboard([Markup.callbackButton("Добавиться", `add ${spot.hash}`)]).extra()
    );
  }
}

module.exports = Components;
