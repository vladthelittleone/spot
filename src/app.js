require("./bot");

const manager = require("./managers");
const GroupManager = require("./managers/group");

manager.start(GroupManager);
