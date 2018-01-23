const logger = require("../utils/log")(module);
const SpotAPI = require('../api');
const moment = require('moment');

class GroupManager {

  static async execute () {

    const spots = await SpotAPI.getOpenSpots();

    for (const spot of spots) {

      const {spotTime, fromID} = spot,
        diff = moment(spotTime).diff(new Date(), 'hours');

      if (diff < 24 && diff > 0) logger.info(fromID);
    }
  }
}

module.exports = GroupManager;
