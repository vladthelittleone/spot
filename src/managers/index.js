const mongoose = require("../utils/mongoose");
const config = require("../config/index");
const GroupManager = require("./group-manager");

class JobManager {

  static startJobs(delay) {
    mongoose.connection.on("open", () => {
      this.start(GroupManager, delay || config.get("server:delay"));
    });
  }

  static stopJobs() {
    this.stop(GroupManager);
  }

  static start(manager, delay) {
    const exec = GroupManager.execute;
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
