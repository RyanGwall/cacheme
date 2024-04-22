const Geocache = require('../models/geocache');
const Rating = require('../models/rating');


module.exports.createRating = async (req, res) => {
    const geocache = await Geocache.findById(req.params.id);
    const rating = new Rating(req.body.rating);
    rating.owner = req.user._id;
    geocache.ratings.push(rating);
    await rating.save();
    await geocache.save();
    req.flash('success', 'Your Review was Successfully Created!')
    res.redirect(`/geocaches/${geocache._id}`);
};

module.exports.deleteRating = async (req, res) => {
    const { id, ratingId } = req.params;
    await Geocache.findByIdAndUpdate(id, { $pull: { ratings: ratingId } });
    await Rating.findByIdAndDelete(ratingId);
    req.flash('deleted', 'Your review was deleted.');
    res.redirect(`/geocaches/${id}`);
};
