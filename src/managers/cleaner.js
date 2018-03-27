const models = require('../models');
const moment = require('moment');
const bot = require('../bot');

class CleanJob {
  static async execute() {
    const spots = await models.Spot.getSpots();
    for (const spot of spots) {
      if (moment(spot.spotTime, moment.ISO_8601).diff(moment()) < 0) {
        await models.Spot.removeSpot(spot.hash);
        const {groupId} = spot;
        groupId && await bot.notification.notifyAboutMatchIsOver(spot.groupId, bot.message.SPOT_IS_OVER);
      }
    }
  }
}

module.exports = CleanJob;
