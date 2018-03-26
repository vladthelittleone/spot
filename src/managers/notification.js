const SpotModel = require("../models/spot");
const moment = require("moment");
const {notify} = require("../bot/notification");
const {NOTIFY_STATUS} = require("../bot/status");
const message = require("../bot/message");

class NotificationJob {
  static async execute() {
    const spots = await SpotModel.getSpots();
    for (const spot of spots) {
      const {notifyStatus} = spot;
      const diff = moment(spot.spotTime, moment.ISO_8601).diff(moment(), "hours");
      const is24hBeforeMatch = diff === 24;
      const is2hBeforeMatch = diff === 2;
      if (is24hBeforeMatch && notifyStatus !== NOTIFY_STATUS.NOTIFIED_ONE_DAY_BEFORE) {
        await notify(spot, message.NOTIFIED_ONE_DAY_BEFORE(spot), NOTIFY_STATUS.NOTIFIED_ONE_DAY_BEFORE)
      } else if (is2hBeforeMatch && notifyStatus !== NOTIFY_STATUS.NOTIFIED_TWO_HOUR_BEFORE) {
        await notify(spot, message.NOTIFIED_TWO_HOUR_BEFORE(spot), NOTIFY_STATUS.NOTIFIED_TWO_HOUR_BEFORE)
      }
    }
  }
}

module.exports = NotificationJob;
