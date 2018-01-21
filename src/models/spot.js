"use strict";

const mongoose = require("../utils/mongoose");

const Schema = mongoose.Schema;

let schema = new Schema({
  fromId:      Number,
  spotTime:    String,
  sportType:   String,
  created:     Date,
  count:       String,
  price:       String,
  location:    String,
  paymentInfo: String
});

const Spot = mongoose.model("spot", schema);

module.exports = Spot;

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
    })
  ;
  return await group.save();
};
