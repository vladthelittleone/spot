"use strict";

/**
 * @author Skurishin Vladislav
 */
const mongoose = require("mongoose");
const config = require("../config");
const logger = require("./log")(module);

// Флаг для определения - является ли текущей коннект тестовым.
mongoose.set(
  "test",
  process.env.NODE_ENV === "test"
);

mongoose.set(
  "debug",
  config.get("database:debug")
);

let databaseUri = mongoose.get("test") ? config.get("database:testUri")
  : config.get("database:uri");

const connectPromise = mongoose.connect(
  databaseUri,
  config.get("database:options")
);

/**
 * For test use.
 */
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

function dropCollections (done) {
  mongoose.connection.db.dropCollection("spot", () => {
    if (err) {
      logger.warn("Collection couldn't be removed", err);
    }
    done && done();
  });
}

function cleanHandler (err) {
  if (err) {
    logger.warn("Collection couldn't be removed", err);
    return;
  }
  logger.info("Collection removed");
}

module.exports = mongoose;
