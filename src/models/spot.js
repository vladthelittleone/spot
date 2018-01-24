const mongoose = require("../utils/mongoose");
const status = require("../utils/status");

const Schema = mongoose.Schema;

const {NOTIFY_STATUS, ENTRY_STATUS} = status;

let schema = new Schema({
  fromID:       Number,
  spotTime:     String,
  sportType:    String,
  created:      Date,
  count:        String,
  price:        String,
  location:     String,
  paymentInfo:  String,
  hashL         String,
  notifyStatus: {
    type:    String,
    enum:    [
      NOTIFY_STATUS.NOT_YET_NOTIFIED,
      NOTIFY_STATUS.NOTIFIED_ONE_DAY_BEFORE,
      NOTIFY_STATUS.NOTIFIED_ONE_HOUR_BEFORE
    ],
    default: NOTIFY_STATUS.NOT_YET_NOTIFIED
  },
  status:       {
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

Spot.getByHash = async (hash) => {
  return await Spot.findOne({hash: hash});
};

Spot.updateNotifyStatus = async (fromID, status) => {
  return await Spot.update({fromID: fromID}, {notifyStatus: status});
};

Spot.create = async (spot) => {
  const group = new Spot({
    fromID:      spot.fromID,
    spotTime:    spot.spotTime,
    location:    spot.location,
    sportType:   spot.sportType,
    hash:        spot.hash,
    price:       spot.price,
    count:       spot.count, // Максимальное кол-во человек или необходимое.
    paymentInfo: spot.paymentInfo,
    created:     Date.now()
  });

  return await group.save();
};

module.exports = Spot;
