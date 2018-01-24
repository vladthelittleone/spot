/**
 * Здесь выполняем логику связанную с группой.
 */

const SpotAPI = require("../api");
const Components = require("./components");

module.exports = (bot) => {

  bot.hears(/start@SpotBBot (.+)/, async (ctx) => {
    const {match} = ctx;
    const spot = await SpotAPI.getSpotByHash(match[1]);
    ctx.replyWithMarkdown("*=> Создан новый матч*")
       .then(() => Components.replyMatch(ctx, spot));
  });
};
