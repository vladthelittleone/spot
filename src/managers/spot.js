const SpotModel = require("../models/spot");
const moment = require("moment");
const send = require("../bot/notification");
const status = require("../utils/status");
const message = require("../bot/message");

const {NOTIFY_STATUS} = status;

class SpotManager {

  static async execute () {

    const spots = await SpotModel.getOpenSpots();

    for (const spot of spots) {

      const {spotTime, fromID, notifyStatus} = spot,
        diff = moment(spotTime, moment.ISO_8601).diff(moment(), "hours");

      if (diff <= 24 && diff >= 0 && notifyStatus === NOTIFY_STATUS.NOT_YET_NOTIFIED) {
        await send(fromID, message.NOTIFIED_ONE_DAY_BEFORE);
        await SpotModel.updateNotifyStatus(fromID, NOTIFY_STATUS.NOTIFIED_ONE_DAY_BEFORE);
      } else if (diff <= 1 && diff >= 0 && notifyStatus === NOTIFY_STATUS.NOTIFIED_ONE_DAY_BEFORE) {
        await send(fromID, message.NOTIFIED_ONE_HOUR_BEFORE);
        await SpotModel.updateNotifyStatus(fromID, NOTIFY_STATUS.NOTIFIED_ONE_HOUR_BEFORE);
      }
    }
  }
}

module.exports = SpotManager;
