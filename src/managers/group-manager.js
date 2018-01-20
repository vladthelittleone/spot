"use strict";

const logger = require("../utils/log");

class GroupManager {
  async execute () {
    logger.info("Group manager execute.");
  }
}

module.exports = new GroupManager();
