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

mongoose.clean = function (withResources, done) {
  if (mongoose.get("test")) {
    if (!connectPromise.done) {
      connectPromise.then(() => {
        dropCollections(withResources, done);
      }, () => {
        logger.warn("Can\"t open connection.");
      });
    } else {
      dropCollections(withResources, done);
    }
  }
};

function dropCollections (withResources, done) {
  mongoose.connection.db.dropCollection("interviews", cleanHandler);
  mongoose.connection.db.dropCollection("users", cleanHandler);
  mongoose.connection.db.dropCollection("practice-queues", cleanHandler);
  mongoose.connection.db.dropCollection("practice-groups", cleanHandler);
  withResources && mongoose.connection.db.dropCollection("resources", cleanHandler);
  done && done();
}

function cleanHandler (err) {
  if (err) {
    logger.warn("Collection couldn\"t be removed", err);
    return;
  }
  logger.info("Collection removed");
}

module.exports = mongoose;
