const mongoose = require("../utils/mongoose");

const Schema = mongoose.Schema;
const lodash = require("lodash");

const SPOT_STATUS = {
  "OPEN":       "open",
  "CLOSED":     "closed",
  "WAIT_GROUP": "wait_group"
};

let schema = new Schema({
  fromId:      Number,
  count:       Number,
  spotTime:    String,
  sportType:   String,
  created:     Date,
  price:       String,
  location:    String,
  paymentInfo: String,
  hash:        String,
  groupId:     String,
  players:     Array,
  status:      {
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

Spot.getOpenSpots = async () => {
  return await Spot.find({status: SPOT_STATUS.OPEN});
};

Spot.getByHash = async (hash) => {
  return await Spot.findOne({hash: hash});
};

Spot.addPlayer = async (hash, from) => {
  const spot = await Spot.getByHash(hash);
  const isFull = spot && spot.count <= spot.players.length;
  if (!isFull && !lodash.includes(spot.players, from)) {
    return await Spot.findOneAndUpdate(
      {hash: hash},
      {
        $push: {"players": from}
      }
    );
  }
};

Spot.addGroupId = async (hash, groupId) => {
  return await Spot.findOneAndUpdate(
    {hash: hash},
    {
      groupId,
      status: SPOT_STATUS.OPEN
    }
  );
};

Spot.create = async (spot) => {
  const group = new Spot({
    fromId:      spot.fromId,
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
