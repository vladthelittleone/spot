const bot = require('./index');

class Notification {

  static async send (chat, text) {

    await bot.telegram.sendMessage(chat, text, {parse_mode: 'Markdown'});
  }
}

module.exports = Notification;
