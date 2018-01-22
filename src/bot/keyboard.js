const Markup = require("telegraf/markup");
const message = require('./message');

const main = (ctx) => {
  ctx.reply("Выберите действие", Markup.keyboard([
    [message.OPEN_GROUPS],
    [message.CREATE]
  ])
                                       .resize()
                                       .extra());
};

module.exports = {main};
