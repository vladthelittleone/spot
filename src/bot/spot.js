/**
 * Здесь выполняем логику связанную с группой.
 */

const SpotModel = require("../models/spot");
const Components = require("./components");
const message = require('./message');
const Markup = require("telegraf/markup");
const spots = {};

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
           .then(() => Components.showMatch(ctx, spot));
      }
    }
  });

  bot.on("contact", async (ctx) => {
    const {from} = ctx;
    Components.chooseMainAction(ctx);
    if (ctx.message.contact) {
      const phone = ctx.message.contact.phone_number;
      if (spots[from.id]) {
        const {groupID} = spots[from.id];
        await bot.telegram.sendMessage(
          groupID,
          message.NEW_PLAYER_WANTS_TO_ADD,
          {parse_mode: "Markdown"}
        );
        await bot.telegram.sendContact(groupID, phone, `${from.first_name} ${from.last_name}`);
      }
    }
  });

  bot.command('next', async (ctx) => {
    const groupID = ctx.update.message.chat.id;
    SpotModel.getSpotByGroupID(groupID)
             .then((spot) => {
               bot.telegram.sendMessage(groupID, message.SPOT_INFO(spot));
             });
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
    if (ctx.chat.type === "private") {
      const {match, from} = ctx;
      const hash = match[1];
      const currentSpot = await SpotModel.getCurrentSpot(from.id);
      spots[from.id] = await SpotModel.getByHash(hash);

      if (!currentSpot) {
        return ctx.replyWithMarkdown(
          "Чтобы добавления вас в матч, необходимо отправить ваш телефонный номер создателю матча.\n" +
          "Нажмите на кнопку *\"Отправить контакт\"*, если согласны.",
          Markup.keyboard([
            Markup.contactRequestButton("Отправить контакт")
          ]).resize().extra()
        );
      } else {
        ctx.reply(message.SPOT_ALREADY_ACTIVE);
        Components.showMatch(ctx, currentSpot);
      }
    }
  });
};

