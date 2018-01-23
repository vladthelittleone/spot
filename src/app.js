require('./bot');

const manager = require('./managers');
const GroupManager = require('./managers/group');
const mongoose = require('./utils/mongoose');

manager.start(GroupManager);

setTimeout(async () => {

  manager.stop(GroupManager);

  await mongoose.disconnect();
}, 500);
