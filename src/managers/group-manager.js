const logger = require("../utils/log")(module);

class GroupManager {

  static async execute () {
    logger.info("Group manager execute.");
  }
}

module.exports = GroupManager;
