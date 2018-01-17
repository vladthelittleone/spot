/**
 * @author Skurishin Vladislav
 */
const passport = require('passport');

const User = require('../models/user');

module.exports = PassportAuthentication();

function PassportAuthentication () {
  /**
   * Сериализация сессии.
   */
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  /**
   * Десериализация сессии.
   */
  passport.deserializeUser(async function (obj, done) {
    const user = await User.findOne({'profile.id': obj.profile.id});

    done(null, user);
  });

  return {
    github: require('./github')
  };
}
