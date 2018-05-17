const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactPersonSchema = new Schema({
    id: String,
    contactPerson: String,
    contactPhone: String,
    mobile: String,
    mail: String,
    client: [{
        type: Schema.Types.ObjectId,
        ref: 'client'
    }],
    tstamp: {
        type: Date,
        default: Date.now
    },
    deleted: {
        type: Boolean,
        default: false
    }
});

ContactPersonSchema.statics.findClient = function (id) {

    return this.findById(id)
        .populate({
            path: 'client',
            match: {
                deleted: false
            }
        }).then(contact => contact.client);
};


mongoose.model('contactPerson', ContactPersonSchema);