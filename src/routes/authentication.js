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
  '/vk',
  passport.authenticate('vkontakte', {scope: ['user:email']})
);

// Сюда будет перенаправлять сам гитхаб, после окончания попытки авторизации.
router.get(
  '/vk/callback',
  passport.authenticate('vkontakte', {failureRedirect: '/'}),
  (req, res) => {
    res.redirect('/');
  }
);

router.get('/logout', checkAuthentication, (req, res) => {
  req.logout();
  res.redirect('/');
});
