const logger = require('../utils/log')(module);
const SpotAPI = require('../api');
const mongoose = require('../utils/mongoose');
const devSpots = require('./dev.migration');

const migration = async () => {

  logger.info('starting database migration');

  await  SpotAPI.cleanSpots();

  for (const spot of devSpots) {
    await SpotAPI.createSpot(spot)
  }

  await SpotAPI.getOpenSpots();

  mongoose.disconnect();

  logger.info('database migration ended')
};

migration();
