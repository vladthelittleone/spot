/**
 * @since 24.01.2018
 * @author Skurishin Vladislav
 */
const Markup = require("telegraf/markup");

class Components {
  static replyMatch(ctx, spot) {
    const {sportType, spotTime, location, price, count, fromId} = spot;
    let str = "";
    str += `Вид спорта: ${sportType}\n`;
    str += `Дата проведения: ${spotTime}\n`;
    str += `Место проведения: ${location}\n`;
    str += `Цена: ${price}\n`;
    str += `Необходимо: ${count} человек`;
    ctx.reply(
      str,
      Markup.inlineKeyboard([Markup.callbackButton("Добавиться", fromId)]).extra()
    );
  }
}

module.exports = Components;
