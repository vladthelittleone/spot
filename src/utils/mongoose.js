const mongoose = require("mongoose");
const config = require("../config");
const logger = require("./log")(module);

// flag for set test mongo uri
mongoose.set(
  "test",
  process.env.NODE_ENV === "test"
);

mongoose.set(
  "debug",
  config.get("database:debug")
);

let databaseUri = mongoose.get("test") ?
  config.get("database:testUri") : config.get("database:uri");

const connectPromise = mongoose.connect(
  databaseUri,
  config.get("database:options")
);

mongoose.Promise = global.Promise;

// for test and migration use
mongoose.clean = function (done) {
  if (mongoose.get("test")) {
    if (!connectPromise.done) {
      connectPromise.then(() => {
        dropCollections(done);
      }, () => {
        logger.warn("Can't open connection.");
      });
    } else {
      dropCollections(done);
    }
  }
};

const dropCollections = (done) => {
  mongoose.connection.db.dropCollection("spots", (error) => {
    if (error) logger.warn("Collection couldn't be removed", error);
    done && done();
  });
};

module.exports = mongoose;
