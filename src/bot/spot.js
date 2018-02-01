/**
 * Здесь выполняем логику связанную с группой.
 */

const SpotModel = require("../models/spot");
const Components = require("./components");
const message = require('./message');

module.exports = (bot) => {
  bot.hears(/start@SpotBBot (.+)/, async (ctx) => {
    if (ctx.chat.type === "group") {
      const {match} = ctx;
      const hash = match[1];
      const spot = await SpotModel.getByHash(hash);
      spot.groupID = ctx.chat.id;
      if (spot) {
        await SpotModel.addGroupID(hash, spot.groupID);
        ctx.reply(message.NEW_SPOT_IS_CREATED)
           .then(() => Components.replyMatch(ctx, spot));
      }
    }
  });

  bot.action(/add (.+)/, async (ctx) => {
    if (ctx.chat.type === "group") {
      const {match, from} = ctx;
      const groupID = ctx.chat.id;
      const hash = match[1];
      const spot = await SpotModel.addPlayer(hash, from);
      if (spot) {
        let str = '';
        str += `${from.first_name} ${from.last_name} пойдет на матч.\n`;
        str += `👍 ${spot.players.length + 1} / ${spot.count}`;
        bot.telegram.sendMessage(groupID, str);
      }
    }
  });
};

