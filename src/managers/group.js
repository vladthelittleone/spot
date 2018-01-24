const SpotAPI = require('../api');
const moment = require('moment');
const Notification = require('../bot/notification');
const status = require('../utils/status');
const message = require('../bot/message');

const {NOTIFY_STATUS} = status;

class GroupManager {

  static async execute () {

    const spots = await SpotAPI.getOpenSpots();

    for (const spot of spots) {

      const {spotTime, fromID, notifyStatus} = spot,
        diff = moment(spotTime, moment.ISO_8601).diff(new Date(), 'hours');

      if (diff <= 24 && diff >= 0 && notifyStatus === NOTIFY_STATUS.NOT_YET_NOTIFIED) {
        await Notification.send(fromID, message.NOTIFY_ONE_DAY_BEFORE);
        await SpotAPI.updateNotifyStatus(fromID, NOTIFY_STATUS.NOTIFIED_ONE_DAY_BEFORE);
      } else if (diff <= 1 && diff >= 0 && notifyStatus === NOTIFY_STATUS.NOTIFIED_ONE_DAY_BEFORE) {
        await Notification.send(fromID, message.NOTIFY_ONE_HOUR_BEFORE);
        await SpotAPI.updateNotifyStatus(fromID, NOTIFY_STATUS.NOTIFIED_ONE_HOUR_BEFORE);
      }
    }
  }
}

module.exports = GroupManager;