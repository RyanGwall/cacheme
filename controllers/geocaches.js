const Geocache = require('../models/geocache');
const { cloudinary } = require('../cloudinary');
const mapboxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mapboxGeocoding({ accessToken: mapboxToken });

module.exports.index = async (req, res) => {
    const geocaches = await Geocache.find({});
    res.render('geocaches/index', { geocaches });
};

module.exports.newForm = (req, res) => {
    res.render('geocaches/new');
};

module.exports.createGeocache = async (req, res, next) => {
    const geodata = await geocoder.forwardGeocode({
        query: req.body.geocache.location,
        limit: 1
    }).send();
    const geocache = new Geocache(req.body.geocache);
    geocache.geometry = (geodata.body.features[0].geometry);
    geocache.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    geocache.owner = req.user._id;
    await geocache.save();
    console.log(geocache);
    req.flash('success', 'Successfully Created a New Geocache!');
    res.redirect(`/geocaches/${geocache._id}`);
};

module.exports.showGeocache = async (req, res) => {
    const geocache = await Geocache.findById(req.params.id).populate({
        path: 'ratings',
        populate: {
            path: 'owner'
        }
    }).populate('owner');
    if (!geocache) {
        req.flash('error', 'This Geocache Could Not Be Found In Our Database.');
        return res.redirect('/geocaches');
    };
    res.render('geocaches/show', { geocache });
};

module.exports.updateForm = async (req, res) => {
    const { id } = req.params;
    const geocache = await Geocache.findById(id);
    if (!geocache) {
        req.flash('error', 'This Geocache Could Not Be Found In Our Database.');
        return res.redirect('/geocaches');
    }
    res.render('geocaches/edit', { geocache });
};

module.exports.updateGeocache = async (req, res) => {
    const { id } = req.params;
    const geocache = await Geocache.findByIdAndUpdate(id, { ...req.body.geocache });
    const imgs = (req.files.map(f => ({ url: f.path, filename: f.filename })));
    geocache.images.push(...imgs);
    await geocache.save();
    if (req.body.removeImages) {
        for (let filename of req.body.removeImages) {
            await cloudinary.uploader.destroy(filename);
        }
        const trimmedImages = req.body.removeImages.map((almg => almg.trim()));
        await geocache.updateOne(
            { $pull: { images: { filename: { $in: trimmedImages } } } },
            { new: true });
    }
    req.flash('success', 'Successfully Updated the Geocache!');
    res.redirect(`/geocaches/${geocache._id}`);
};

module.exports.destroyGeocache = async (req, res) => {
    const { id } = req.params;
    await Geocache.findByIdAndDelete(id);
    req.flash('deleted', 'Your Geocache was Deleted.');
    res.redirect('/geocaches');
};