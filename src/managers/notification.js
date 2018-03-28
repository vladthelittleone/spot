const models = require("../models");
const moment = require("moment");
const bot = require("../bot");

const NOTIFY_STATUS = bot.types.NOTIFY_STATUS;

class NotificationJob {
  static async execute() {
    const spots = await models.Spot.getSpots();
    for (const spot of spots) {
      const {notifyStatus} = spot;
      const diff = moment(spot.spotTime, moment.ISO_8601).diff(moment(), "hours");
      const is24hBeforeMatch = diff <= 25 && diff >= 23;
      const is2hBeforeMatch = diff <= 2 && diff >= 0;
      if (is24hBeforeMatch && notifyStatus !== NOTIFY_STATUS.NOTIFIED_ONE_DAY_BEFORE) {
        await bot.notification.notify(
          spot,
          bot.message.NOTIFIED_ONE_DAY_BEFORE(spot),
          NOTIFY_STATUS.NOTIFIED_ONE_DAY_BEFORE);
      } else if (is2hBeforeMatch && notifyStatus !== NOTIFY_STATUS.NOTIFIED_TWO_HOUR_BEFORE) {
        await bot.notification.notify(
          spot,
          bot.message.NOTIFIED_TWO_HOUR_BEFORE(spot),
          NOTIFY_STATUS.NOTIFIED_TWO_HOUR_BEFORE);
      }
    }
  }
}

module.exports = NotificationJob;
