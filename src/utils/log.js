/**
 * @author Skurishin Vladislav
 */
const winston = require('winston');
const ENV = process.env.NODE_ENV;

// can be much more flexible than that O_o
function getLogger (module) {
  let path = module.filename.split('/').slice(-2).join('/');

  return new winston.Logger({
    transports: [
      new winston.transports.Console({
        colorize: true,
        level:    (ENV === 'development') ? 'debug' : 'error',
        label:    path
      })
    ]
  });
}

module.exports = getLogger;
