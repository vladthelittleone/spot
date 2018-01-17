'use strict';

/**
 * @author Skurishin Vladislav
 */
module.exports = function (app) {
  app.use('/api/auth', require('./authentication'));
};
