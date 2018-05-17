const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    id: String,
    name: String,
    value: String,
    tstamp: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('category', CategorySchema);