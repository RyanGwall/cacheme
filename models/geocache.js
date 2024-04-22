const mongoose = require('mongoose');
const Rating = require('./rating');
const Schema = mongoose.Schema;


const imageSchema = new Schema({
    url: String,
    filename: String

});

imageSchema.virtual('thumb').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: {virtuals: true}};

const geocacheSchema = new Schema({
    title: String,
    description: String,
    images: [imageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    value: Number,
    location: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'Profile'
    },
    ratings: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Rating'
        }
    ]
}, opts);

geocacheSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/geocaches/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`;
});

geocacheSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Rating.deleteMany({
            _id: {
                $in: doc.ratings
            }
        })
    }
});

module.exports = mongoose.model('Geocache', geocacheSchema);