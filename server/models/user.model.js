const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const mongooseUniqueValidator = require('mongoose-unique-validator');

const UserSchema = new Schema({
    id: String,
    username: String,
    password: String,
    email: {
        type: String,
        unique: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
    superAdmin: {
        type: Boolean,
        default: false
    }

});
UserSchema.plugin(mongooseUniqueValidator);


UserSchema.statics.addNewUser = function (args) {
    const User = mongoose.model('user');
    const password = bcrypt.hashSync(args.password, 10);

    return new User({
        username: args.username,
        password: password,
        email: args.email
    }).save(user => user)
};

mongoose.model('user', UserSchema);