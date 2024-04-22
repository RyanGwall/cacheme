const { geocacheSchema, ratingSchema } = require('./joiSchemas.js');
const ExpressError = require('./utilities/ExpressError');
const Geocache = require('./models/geocache');
const Rating = require('./models/rating');


module.exports.isSignedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnToUrl = req.originalUrl;
        req.flash('error', 'You must be signed in to view this page.');
        return res.redirect('/signin');
    }
    next();
};

module.exports.storeReturnToUrl = (req, res, next) => {
    if (req.session.returnToUrl) {
        res.locals.returnToUrl = req.session.returnToUrl;
    }
    next();
};

module.exports.validateGeocache = (req, res, next) => {
    const { error } = geocacheSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

module.exports.isAuthorized = async (req, res, next) => {
    const { id } = req.params;
    const geocache = await Geocache.findById(id);
    if (!geocache.owner.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to access this.');
        return res.redirect(`/geocaches/${id}`);
    }
    next();
};

module.exports.isRatingAuthorized = async (req, res, next) => {
    const { id, ratingId } = req.params;
    const rating = await Rating.findById(ratingId);
    if (!rating.owner.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do this!');
        return res.redirect(`/geocaches/${id}`);
    }
    next();
};

module.exports.validateRating = (req, res, next) => {
    const { error } = ratingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};