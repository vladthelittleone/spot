require("./bot");

const manager = require("./managers");
const SpotManager = require("./managers/spot");

manager.start(SpotManager);
