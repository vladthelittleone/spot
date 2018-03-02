/**
 * here execute logic with group
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
      spot.groupId = ctx.chat.id;
      if (spot) {
        await SpotModel.addGroupId(hash, spot.groupId);
        ctx.reply(message.NEW_SPOT_IS_CREATED)
           .then(() => Components.sendMatch(ctx, spot));
      }
    }
  });

  bot.on("contact", async (ctx) => {
    const {from} = ctx;
    Components.chooseMainAction(ctx);
    if (ctx.message.contact) {
      const phone = ctx.message.contact.phone_number;
      if (spots[from.id]) {
        const {groupId} = spots[from.id];
        await bot.telegram.sendMessage(
          groupId,
          message.NEW_PLAYER_WANTS_TO_ADD,
          {parse_mode: "Markdown"}
        );
        await bot.telegram.sendContact(groupId, phone, `${from.first_name} ${from.last_name}`);
      }
    }
  });

  bot.command('next', async (ctx) => {
    const groupId = ctx.update.message.chat.id;
    SpotModel.getSpotByGroupId(groupId)
             .then((spot) => Components.sendMatch(ctx, spot));
  });

  bot.action(/add (.+)/, async (ctx) => {
    if (ctx.chat.type === "group") {
      const {match, from} = ctx;
      const groupId = ctx.chat.id;
      const hash = match[1];
      const spot = await SpotModel.addPlayer(hash, from);
      if (spot) {
        let str = '';
        str += `${from.first_name} ${from.last_name} пойдет на матч.\n`;
        str += `👍 ${spot.players.length + 1} / ${spot.count}`;
        bot.telegram.sendMessage(groupId, str);
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
        Components.sendMatch(ctx, currentSpot);
      }
    }
  });
};
