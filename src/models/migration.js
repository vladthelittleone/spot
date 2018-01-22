const logger = require('../utils/log')(module);
const SpotAPI = require('../api');
const mongoose = require('../utils/mongoose');

logger.info('starting database migration');

SpotAPI.getOpenGroups().then((groups) => {
  logger.info(groups);

  mongoose.disconnect()
});
