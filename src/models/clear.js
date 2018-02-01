const logger = require("../utils/log")(module);
const mongoose = require("../utils/mongoose");

const clear = async () => {

  logger.info("starting clearing database");

  await mongoose.clean();
  await mongoose.disconnect();

  logger.info("database clearing ended successful");
};

clear();
