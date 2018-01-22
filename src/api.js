const SpotModel = require("./models/spot");

class SpotAPI {

  static async createSpot (spot) {
    return await SpotModel.create(spot);
  }

  static async getOpenSpots () {
    return await SpotModel.getOpenSpots();
  }
}

module.exports = SpotAPI;
