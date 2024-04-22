const mongoose = require('mongoose');
const passLocMongoose = require('passport-local-mongoose');

const profileSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});
profileSchema.plugin(passLocMongoose);

module.exports = mongoose.model('Profile', profileSchema);