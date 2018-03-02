const mongoose = require("../utils/mongoose");
const {NOTIFY_STATUS, SPOT_STATUS} = require("../bot/status");
const lodash = require("lodash");

const Schema = mongoose.Schema;

let schema = new Schema({
  fromId:       Number,
  count:        Number,
  created:      Date,
  spotTime:     String,
  spotType:     String,
  price:        String,
  location:     Object,
  locationText: String,
  paymentInfo:  String,
  hash:         String,
  groupId:      String,
  groupTitle:   String,
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
    },
    {
      new: true
    }
  );
};

Spot.getOpenSpots = async () => {
  return await Spot.find({status: SPOT_STATUS.OPEN});
};

Spot.getByHash = async (hash) => {
  return await Spot.findOne({hash: hash});
};

Spot.updateNotifyStatus = async (fromId, status) => {
  return await Spot.findOneAndUpdate(
    {fromId: fromId},
    {notifyStatus: status}
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

Spot.getSpotByGroupId = async (id) => {
  return await Spot.findOne({groupId: id});
};

Spot.getByFromId = async (fromId) => {
  return await Spot.findOne({fromId: fromId});
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

Spot.addGroup = async (hash, groupId, groupTitle) => {
  return await Spot.findOneAndUpdate(
    {hash: hash},
    {
      groupId,
      groupTitle,
      status: SPOT_STATUS.OPEN
    }
  );
};

Spot.updateSpotFromId = async (fromId, newId) => {
  return await Spot.findOneAndUpdate(
    {fromId: fromId},
    {fromId: newId}
  );
};

Spot.create = async (spot) => {
  const group = new Spot({
    fromId:       spot.fromId,
    spotTime:     spot.spotTime,
    location:     spot.location,
    locationText: spot.locationText,
    spotType:     spot.spotType,
    hash:         spot.hash,
    price:        spot.price,
    count:        spot.count, // insert max human at spot
    paymentInfo:  spot.paymentInfo,
    created:      Date.now(),
    players:      []
  });
  return await group.save();
};

module.exports = Spot;
