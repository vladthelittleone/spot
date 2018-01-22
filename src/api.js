const SpotModel = require("./models/spot");

class SpotAPI {

  static async createSpot(spot) {
    await SpotModel.create(spot);
  }

  static async getOpenGroups() {
    return await SpotModel.getOpenGroups();
  }
}

module.exports = SpotAPI;
