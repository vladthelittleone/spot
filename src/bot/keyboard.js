const Markup = require("telegraf/markup");
const message = require('./message');
const lodash = require('lodash');

const main = (ctx) => {
  ctx.reply("Выберите действие", Markup.keyboard([
    [message.OPEN_GROUPS],
    [message.CREATE]
  ])
                                       .resize()
                                       .extra());
};

const chooseSpotType = (ctx, sportTypes) => {

  const keyboard = lodash.map(sportTypes, (s) => Markup.callbackButton(s, s));

  ctx.reply(
    "Введите тип спортвного матча.",
    Markup.inlineKeyboard(keyboard).extra()
  );
};

module.exports = {main, chooseSpotType};
