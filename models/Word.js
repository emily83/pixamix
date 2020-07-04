const mongoose = require('mongoose');
const random = require('mongoose-simple-random');

const WordSchema = new mongoose.Schema({
    word: {
        type: String,
        trim: true,
        required: [true, 'Please enter word']
    },
    used: {
        type: Number,
        default: 0
    }
});

WordSchema.plugin(random);

module.exports = mongoose.model('Word', WordSchema);