const SpotModel = require("./models/spot");

class SpotAPI {

  static async createSpot (spot) {
    return await SpotModel.create(spot);
  }

  static async getOpenSpots () {
    return await SpotModel.getOpenSpots();
  }

  static async updateNotifyStatus (fromID, status) {
    return await SpotModel.updateNotifyStatus(fromID, status);
  }

  static async getSpotByHash (hash) {
    return await SpotModel.getByHash(hash);
  }
}

module.exports = SpotAPI;
