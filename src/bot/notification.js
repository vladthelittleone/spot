const bot = require("./index");
const Spot = require('../models/spot');
const Components = require('./components');

const send = async (chat, text) => {
  chat && await bot.telegram.sendMessage(chat, text, {parse_mode: "Markdown"});
};

const notify = async (spot, message, nextStatus) => {
  const {groupId, location, fromId} = spot;
  location && await Components.sendLocation(groupId, location);
  await send(groupId, message);
  await Spot.updateNotifyStatus(fromId, nextStatus);
};

const notifyAboutMatchIsOver = async (groupId, message) => {
  return await send(groupId, message);
};

module.exports.notify = notify;
module.exports.notifyAboutMatchIsOver = notifyAboutMatchIsOver;
