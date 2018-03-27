require("./bot").bot;

const managers = require("./managers");

managers.JobManager.start(managers.NotificationJob);
managers.JobManager.start(managers.CleanJob);
