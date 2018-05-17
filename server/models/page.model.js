const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PageSchema = new Schema({
        id: String,
        type: {
            type: Number,
            default: 2
        },
        pageType: {
            type: Number,
            default: 1
        },
        title: String,
        subtitle: String,
        bodytext: String,
        tstamp: {
            type: Date,
            default: Date.now
        },
        defaultPage: {
            type: Boolean,
            default: true
        },
        order: Number,
        pageNew: {
            type: Boolean,
            default: false
        },
        files: Array,
        legal: {
            type: Boolean,
            default: false
        },
        deleted: {
            type: Boolean,
            default: false
        }
    },
    {
        usePushEach: true
    });

mongoose.model('page', PageSchema);