const mongoose = require("../utils/mongoose");
const config = require("../config/index");

class JobManager {

  static startJobs(manager, delay) {
    mongoose.connection.on("open", () => {
      this.start(manager, delay || config.get("server:delay"));
    });
  }

  static stopJobs(manager) {
    this.stop(manager);
  }

  static start(manager, delay) {
    const exec = manager.execute;
    exec && exec();
    manager.interval && JobManager.stop(manager);
    manager.interval = setInterval(
      exec,
      delay
    );
  }

  static stop(manager) {
    manager.interval && clearInterval(manager.interval);
  }
}

module.exports = JobManager;
