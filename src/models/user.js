'use strict';

const mongoose = require('../utils/mongoose');

const Schema = mongoose.Schema;

let schema = new Schema({
  profile:     mongoose.Schema.Types.Mixed,
  created:     Date,
});

const User = mongoose.model('user', schema);

module.exports = User;

User.create = async (profile) => {
  const user = new User({
    profile:     profile,
    created:     Date.now()
  });
  return await user.save();
};
