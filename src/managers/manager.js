const config = require("../config/index");
const utils = require('../utils');

class JobManager {
  static start(manager) {
    utils.mongoose.connection.on("open", async () => {
      for (; ;) {
        await utils.sleep(config.get("manager:delay"));
        manager.execute();
      }
    });
  }
}

module.exports = JobManager;
