require("./bot");

const manager = require("./managers");
const NotifyOperations = require("./managers/notification");
const CleanOperations = require('./managers/cleaner');
manager.start(NotifyOperations);
manager.start(CleanOperations);
