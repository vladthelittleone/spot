const Spot = require('../models/spot');
const moment = require('moment');
const {notifyAboutMatchIsOver} = require('../bot/notification');
const message = require('../bot/message');

class CleanerManager {
  static async execute () {
    const spots = await Spot.getSpots();
    for (const spot of spots) {
      if (moment(spot.spotTime, moment.ISO_8601).diff(moment()) < 0) {
        await Spot.removeSpot(spot.hash);
        const {groupId} = spot;
        groupId && await notifyAboutMatchIsOver(spot.groupId, message.SPOT_IS_OVER);
      }
    }
  }
}

module.exports = CleanerManager;
