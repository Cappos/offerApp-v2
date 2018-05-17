const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SealerSchema = new Schema({
    id: String,
    position: String,
    title: String,
    name: String,
    email: String,
    phone: String,
    mobile: String,
    value: Number,
    active: {
        type: Schema.Types.ObjectId,
        ref: 'offer'
    },
    deleted: {
        type: Boolean,
        default: false
    }
});

mongoose.model('sealer', SealerSchema);