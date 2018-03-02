require("./bot");

const manager = require("./managers");
const NotificationManager = require("./managers/notification");
const CleanerManager = require('./managers/cleaner');
manager.start(NotificationManager);
manager.start(CleanerManager);
