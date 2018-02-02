const mongoose = require("../utils/mongoose");
const status = require("../utils/status");

const Schema = mongoose.Schema;
const lodash = require("lodash");

const {NOTIFY_STATUS, SPOT_STATUS} = status;

let schema = new Schema({
  fromID:       Number,
  count:        Number,
  created:      Date,
  spotTime:     String,
  sportType:    String,
  price:        String,
  location:     String,
  paymentInfo:  String,
  hash:         String,
  groupID:      String,
  players:      Array,
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
      SPOT_STATUS.OPEN,
      SPOT_STATUS.CLOSED,
      SPOT_STATUS.WAIT_GROUP
    ],
    default: SPOT_STATUS.WAIT_GROUP
  }
});

const Spot = mongoose.model("spot", schema);

Spot.removeSpot = async (hash) => {
  return await Spot.findOneAndRemove({hash: hash});
};

Spot.removePlayer = async (hash, from) => {
  return await Spot.findOneAndUpdate(
    {hash: hash},
    {
      $pull:  {"players": from},
      status: SPOT_STATUS.OPEN
    }
  );
};

Spot.getOpenSpots = async () => {
  return await Spot.find({status: SPOT_STATUS.OPEN});
};

Spot.getByHash = async (hash) => {
  return await Spot.findOne({hash: hash});
};

Spot.updateNotifyStatus = async (fromID, status) => {
  return await Spot.findOneAndUpdate(
    {fromID: fromID},
    {
      notifyStatus: status
    }
  );
};

Spot.getCurrentSpot = async (fromId) => {
  const spots = await Spot.find();
  for (const spot of spots) {
    for (const player of spot.players) {
      if (player.id === fromId) {
        return spot;
      }
    }
  }
};

Spot.getByFromID = async (fromID) => {
  return await Spot.findOne({fromID: fromID});
};

Spot.addPlayer = async (hash, from) => {
  const spot = await Spot.getByHash(hash);
  const isFull = spot && spot.count <= spot.players.length;
  const index = lodash.findIndex(spot.players, (p) => p.id === from.id);
  if (!isFull && index === -1) {
    const isFull = spot.count <= spot.players.length + 1;
    return await Spot.findOneAndUpdate(
      {hash: hash},
      {
        $push:  {"players": from},
        status: isFull ? SPOT_STATUS.CLOSED : SPOT_STATUS.OPEN
      }
    );
  }
};

Spot.addGroupID = async (hash, groupID) => {
  return await Spot.findOneAndUpdate(
    {hash: hash},
    {
      groupID,
      status: SPOT_STATUS.OPEN
    }
  );
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
    created:     Date.now(),
    players:     []
  });

  return await group.save();
};

module.exports = Spot;
