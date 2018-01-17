/**
 * @author Skurishin Vladislav
 */
const GitHubStrategy = require('passport-github2').Strategy;

const config = require('../config');
const User = require('../models/user');
const logger = require('../utils/log')(module);

module.exports = new GitHubStrategy(
  {
    clientID:     config.get('github:clientId'),
    clientSecret: config.get('github:clientSecret'),
    callbackURL:  config.get('github:callbackUrl')
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({'profile.id': profile.id});

      if (!user) {
        // Пользователь пришел с гитхаба к нам впервые -> создаем его.
        user = await User.create({profile});
      }

      done(null, user);
    } catch (err) {
      logger.error(err);

      done(err);
    }
  }
);
