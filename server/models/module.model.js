const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ModuleSchema = new Schema({
        id: String,
        name: String,
        bodytext: String,
        price: Number,
        tstamp: {
            type: Date,
            default: Date.now
        },
        cruserId: Number,
        crdate: Date,
        groupId: [{
            type: Schema.Types.ObjectId,
            ref: 'group'
        }],
        categoryId: [{
            type: Schema.Types.ObjectId,
            ref: 'category'
        }],
        moduleNew: {
            type: Boolean,
            default: false,
            writable: true
        },
        defaultModule: {
            type: Boolean,
            default: false
        },
        type: {
            type: Number,
            default: 1
        },
        internalHours: {
            type: Number,
            default: 0
        },
        externalHours: {
            type: Number,
            default: 0
        },
        pricePerHour: {
            type: Number,
            default: 0
        },
        signed: {
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

ModuleSchema.statics.findCategory = function (id) {
    return this.findById(id)
        .populate('categoryId')
        .then(module => module.categoryId);
};

ModuleSchema.statics.findGroup = function (id) {
    return this.findById(id)
        .populate('groupId')
        .then(module => module.groupId);
};

mongoose.model('module', ModuleSchema);