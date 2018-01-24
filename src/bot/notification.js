const bot = require("./index");

const send = async (chat, text) => {
  await bot.telegram.sendMessage(chat, text, {parse_mode: "Markdown"});
};

module.exports = send;
