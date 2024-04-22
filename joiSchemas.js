const baseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': `{{#label}} must not include HTML!`
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {}
                });
                if (clean !== value) return helpers.error('string.escapeHTML', {value})
                return clean;
            }
        }
    }
});

const Joi = baseJoi.extend(extension);


module.exports.geocacheSchema = Joi.object({
    geocache: Joi.object({
        title: Joi.string().required().escapeHTML(),
        value: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    removeImages: Joi.array()
});

module.exports.ratingSchema = Joi.object({
    rating: Joi.object({
        funRating: Joi.number().required().min(0).max(5),
        difficultyRating: Joi.number().min(0).max(5),
        overallRating: Joi.number().required().min(0).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})