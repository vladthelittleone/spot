require("./bot");

const manager = require("./managers");
const NotificationManager = require("./managers/notification");
manager.start(NotificationManager);
