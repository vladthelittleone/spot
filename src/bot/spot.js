/**
 * Здесь выполняем логику связанную с группой.
 */

const SpotAPI = require("../api");
const Components = require("./components");
const message = require('./message');

module.exports = (bot) => {

  bot.hears(/start@SpotBBot (.+)/, async (ctx) => {
    const {match} = ctx;
    const spot = await SpotAPI.getSpotByHash(match[1]);
    ctx.replyWithMarkdown(message.NEW_SPOT_IS_CREATED)
       .then(() => Components.replyMatch(ctx, spot));
  });
};
