const mongoose = require('mongoose');


const ratingSchema = new mongoose.Schema({
    body: String,
    funRating: Number,
    difficultyRating: Number,
    overallRating: Number,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    }
});

module.exports = mongoose.model("Rating", ratingSchema);