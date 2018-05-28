const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    id: String,
    name: String,
    value: String,
    tstamp: {
        type: Date,
        default: Date.now
    },
    deleted: {
        type: Boolean,
        default: false
    }
});

CategorySchema.statics.addCategory = function (args) {
    const Category = mongoose.model('category');

    return this.count().then((count) => {
        return new Category({
            name: args.name,
            value: (parseInt(count) + 1)
        }).save()
    });
};

CategorySchema.statics.updateCategory = function (args) {
    const Category = mongoose.model('category');

    return Category.findOneAndUpdate({_id: args.id}, {
        $set: {
            name: args.name,
            tstmp: args.tstmp
        }
    }, {new: true});
};

mongoose.model('category', CategorySchema);