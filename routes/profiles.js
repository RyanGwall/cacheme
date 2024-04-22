const express = require('express');
const router = express.Router();
const Profile = require('../models/profile');
const wrapAsync = require('../utilities/wrapAsync');
const passport = require('passport');
const { storeReturnToUrl } = require('../middleware');
const profiles = require('../controllers/profiles');

router.route('/register')
    .get(profiles.registerForm)
    .post(wrapAsync(profiles.registerSuccessMessage));

router.route('/signin')
    .get(profiles.signInForm)
    .post(storeReturnToUrl, passport.authenticate('local', { failureFlash: true, failureRedirect: '/signin' }), profiles.signIn);

router.get('/signout', profiles.signOut);

module.exports = router;