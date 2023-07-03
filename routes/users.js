const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users');

const catchAsync = require('../util/catchAsync');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.registerUser));

router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout', users.logout)

module.exports = router;