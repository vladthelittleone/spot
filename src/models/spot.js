const mongoose = require("../utils/mongoose");

const Schema = mongoose.Schema;

const ENTRY_STATUS = {
  "OPEN":   "open",
  "CLOSED": "closed"
};

let schema = new Schema({
  fromId:      Number,
  spotTime:    String,
  sportType:   String,
  created:     Date,
  count:       String,
  price:       String,
  location:    String,
  paymentInfo: String,
  status:      {
    type:    String,
    enum:    [
      ENTRY_STATUS.OPEN,
      ENTRY_STATUS.CLOSED
    ],
    default: ENTRY_STATUS.OPEN
  }
});

const Spot = mongoose.model("spot", schema);

Spot.getOpenSpots = async () => {
  return await Spot.find({status: ENTRY_STATUS.OPEN});
};

Spot.create = async (spot) => {
  const group = new Spot({
    fromId:      spot.fromId,
    spotTime:    spot.spotTime,
    location:    spot.location,
    sportType:   spot.sportType,
    price:       spot.price,
    count:       spot.count, // Максимальное кол-во человек или необходимое.
    paymentInfo: spot.paymentInfo,
    created:     Date.now()
  });

  return await group.save();
};

module.exports = Spot;
