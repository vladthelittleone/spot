/**
 * @author Skurishin Vladislav
 */
const HttpStatus = require('http-status-codes');

/**
 * Данный мидлвар осуществляет проверку аутентификации пользователя.
 */
module.exports = (req, res, next) => {
  if (req.isUnauthenticated()) {
    return res.sendStatus(HttpStatus.UNAUTHORIZED);
  }
  next();
};
