const SpotModel = require("../models/spot");
const moment = require("moment");
const {notify} = require("../bot/notification");
const {NOTIFY_STATUS} = require("../bot/status");
const message = require("../bot/message");

class NotificationJob {
  static async execute () {
    const spots = await SpotModel.getSpots();
    for (const spot of spots) {
      const {notifyStatus} = spot;
      const diff = moment(spot.spotTime, moment.ISO_8601).diff(moment(), "hours");
      const is24hBeforeMatch = diff <= 24 && diff >= 0;
      const is1hBeforeMatch = diff <= 1 && diff >= 0;
      const msg = is1hBeforeMatch ?
                  message.NOTIFIED_ONE_HOUR_BEFORE(spot) :
                  message.NOTIFIED_ONE_DAY_BEFORE(spot);
      const status = is1hBeforeMatch ?
                     NOTIFY_STATUS.NOTIFIED_ONE_HOUR_BEFORE :
                     NOTIFY_STATUS.NOTIFIED_ONE_DAY_BEFORE;
      if (is1hBeforeMatch && notifyStatus === NOTIFY_STATUS.NOTIFIED_ONE_DAY_BEFORE) {
        await notify(spot, msg, status);
      } else if (is24hBeforeMatch && notifyStatus === NOTIFY_STATUS.NOT_YET_NOTIFIED) {
        await notify(spot, msg, status);
      }
    }
  }
}

module.exports = NotificationJob;
