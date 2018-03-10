require("./bot");

const manager = require("./managers");
const NotificationJob = require("./managers/notification");
const CleanJob = require('./managers/cleaner');
manager.start(NotificationJob);
manager.start(CleanJob);
