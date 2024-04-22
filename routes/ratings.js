const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateRating, isSignedIn, isRatingAuthorized } = require('../middleware');
const wrapAsync = require('../utilities/wrapAsync');
const ExpressError = require('../utilities/ExpressError');
const Geocache = require('../models/geocache');
const Rating = require('../models/rating');
const ratings = require('../controllers/ratings');


router.post('/', isSignedIn, validateRating, wrapAsync(ratings.createRating));

router.delete('/:ratingId', isSignedIn, isRatingAuthorized, wrapAsync(ratings.deleteRating));

module.exports = router;