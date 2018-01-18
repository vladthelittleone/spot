'use strict';

/**
 * @author Skurishin Vladislav
 */
module.exports = function (app) {
  app.use('/api', require('./authentication'));
};
