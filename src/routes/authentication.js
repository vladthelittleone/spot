'use strict';

/**
 * Пример авторизации
 *
 * @author Skurishin Vladislav
 */
const express = require('express');
const passport = require('passport');

const router = express.Router();

const checkAuthentication = require('../middlewares/check-authentication');

module.exports = router;

// Сюда отправляем для старта авторизации через гитхаб.
router.get(
  '/github',
  passport.authenticate('github', {scope: ['user:email']})
);

// Сюда будет перенаправлять сам гитхаб, после окончания попытки авторизации.
router.get(
  '/github/callback',
  passport.authenticate('github', {failureRedirect: '/'}),
  (req, res) => {
    res.redirect('/');
  }
);

router.get('/logout', checkAuthentication, (req, res) => {
  req.logout();
  res.redirect('/');
});
