"use strict";

const SpotModel = require("./models/spot");

class SpotAPI {
  static async createSpot (spot) {
    await SpotModel.create(spot);
  }
}

module.exports = SpotAPI;
