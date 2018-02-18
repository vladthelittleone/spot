const mongoose = require("../utils/mongoose");
const config = require("../config/index");

class JobManager {

  static start(manager, delay) {

    mongoose.connection.on("open", () => {

      const exec = manager.execute;
      exec && exec();

      manager.interval && JobManager.stop(manager);
      manager.interval = setInterval(
        exec,
        delay || config.get("manager:delay")
      );
    });
  }

  static stop(manager) {

    manager.interval && clearInterval(manager.interval);
  }
}

module.exports = JobManager;
