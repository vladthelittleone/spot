/**
 * @author Skurishin Vladislav
 */
const VKontakteStrategy = require('passport-vkontakte').Strategy;

const config = require('../config');
const User = require('../models/user');
const logger = require('../utils/log')(module);

module.exports = new VKontakteStrategy(
  {
    clientID:     config.get('vk:clientId'),
    clientSecret: config.get('vk:clientSecret'),
    callbackURL:  config.get('vk:callbackUrl')
  },
  async (accessToken, refreshToken, params, profile, done) => {
    try {
      let user = await User.findOne({'profile.id': profile.id});
      if (!user) {
        // Пользователь пришел с гитхаба к нам впервые -> создаем его.
        user = await User.create(profile);
      }
      done(null, user);
    } catch (err) {
      logger.error(err);
      done(err);
    }
  }
);
