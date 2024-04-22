const express = require('express');
const router = express.Router();
const geocaches = require('../controllers/geocaches');
const wrapAsync = require('../utilities/wrapAsync');
const Geocache = require('../models/geocache'); // May have to remove this line later on
const { isSignedIn, isAuthorized, validateGeocache } = require('../middleware');
const multer = require('multer')
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(wrapAsync(geocaches.index))
    .post(isSignedIn, upload.array('image'), validateGeocache, wrapAsync(geocaches.createGeocache));


router.get('/new', isSignedIn, geocaches.newForm);

router.route('/:id')
    .get(wrapAsync(geocaches.showGeocache))
    .put(isSignedIn, isAuthorized, upload.array('image'), validateGeocache, wrapAsync(geocaches.updateGeocache))
    .delete(isSignedIn, isAuthorized, wrapAsync(geocaches.destroyGeocache));

router.get('/:id/edit', isSignedIn, isAuthorized, wrapAsync(geocaches.updateForm));

module.exports = router;