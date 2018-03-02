const bot = require("./index");
const Spot = require('../models/spot');
const Components = require('./components');

const send = async (chat, text) => {
  chat && await bot.telegram.sendMessage(chat, text, {parse_mode: "Markdown"});
};

const notify = async (spot, message, nextStatus) => {
  const {players, groupId, location, fromId} = spot;
  for (const player of players) {
    location && await Components.sendLocation(player.id, location);
    await send(player.id, message);
  }
  location && await Components.sendLocation(groupId, location);
  await send(groupId, message);
  await Spot.updateNotifyStatus(fromId, nextStatus);
};

const notifyAboutMatchIsOver = async (groupId, message) => {
  return await send(groupId, message);
};

module.exports.notify = notify;
module.exports.notifyAboutMatchIsOver = notifyAboutMatchIsOver;
