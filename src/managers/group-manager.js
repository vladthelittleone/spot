const logger = require("../utils/log")(module);
const SpotAPI = require('../api');
const moment = require('moment');

class GroupManager {

  static async execute () {

    const spots = await SpotAPI.getOpenSpots();

    for (const spot of spots) {

      const {spotTime} = spot;

      logger.info(moment(spotTime).diff(new Date(), 'hours'));
    }
  }
}

module.exports = GroupManager;
