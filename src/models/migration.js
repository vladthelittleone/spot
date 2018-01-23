const logger = require('../utils/log')(module);
const SpotAPI = require('../api');
const mongoose = require('../utils/mongoose');
const devSpots = require('../utils/mongoose/migration');

const migration = async () => {

  logger.info('starting database migration');

  await mongoose.clean();

  for (const spot of devSpots) {
    await SpotAPI.createSpot(spot);
  }

  await SpotAPI.getOpenSpots();

  mongoose.disconnect();

  logger.info('database migration ended successful');
};

migration();
