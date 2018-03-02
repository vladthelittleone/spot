const SpotModel = require("../models/spot");
const moment = require("moment");
const send = require("../bot/notification");
const {NOTIFY_STATUS} = require("../bot/status");
const message = require("../bot/message");
const Components = require("../bot/components");

class NotificationManager {
  static async execute () {
    const spots = await SpotModel.getOpenSpots();
    for (const spot of spots) {
      const {spotTime, notifyStatus} = spot;
      const diff = moment(spotTime, moment.ISO_8601).diff(moment(), "hours");
      const is24hBeforeMatch = diff <= 24 && diff >= 0;
      const is1hBeforeMatch = diff <= 1 && diff >= 0;
      if (diff <= -1) {
        await SpotModel.removeSpot(spot.hash);
      } else if (is24hBeforeMatch && notifyStatus === NOTIFY_STATUS.NOT_YET_NOTIFIED) {
        await notify(
          spot,
          message.NOTIFIED_ONE_DAY_BEFORE(spot),
          NOTIFY_STATUS.NOTIFIED_ONE_DAY_BEFORE
        );
      } else if (is1hBeforeMatch && notifyStatus === NOTIFY_STATUS.NOTIFIED_ONE_DAY_BEFORE) {
        await notify(
          spot,
          message.NOTIFIED_ONE_HOUR_BEFORE(spot),
          NOTIFY_STATUS.NOTIFIED_ONE_HOUR_BEFORE
        );
      }
    }
  }
}

const notify = async (spot, message, nextStatus) => {
  const {players, groupId, location, fromId} = spot;
  for (const player of players) {
    location && await Components.sendLocation(player.id, location);
    await send(player.id, message);
  }
  location && await Components.sendLocation(groupId, location);
  await send(groupId, message);
  await SpotModel.updateNotifyStatus(fromId, nextStatus);
};

module.exports = NotificationManager;
