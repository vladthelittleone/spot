"use strict";

const mongoose = require("../utils/mongoose");

const Schema = mongoose.Schema;

let schema = new Schema({
  fromId:      Number,
  spotTime:    Date,
  created:     Date,
  count:       Number,
  price:       Number,
  location:    String,
  paymentInfo: Object
});

const Spot = mongoose.model("spot", schema);

module.exports = Spot;

Spot.create = async (spot) => {
  const group = new Spot({
      fromId:      spot.fromId,
      spotTime:    spot.spotTime,
      location:    spot.location,
      price:       spot.price,
      count:       spot.count, // Максимальное кол-во человек или необходимое.
      paymentInfo: spot.paymentInfo,
      created:     Date.now()
    })
  ;
  return await group.save();
};
