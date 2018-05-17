const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ClientSchema = new Schema({
        id: String,
        companyName: String,
        address: String,
        webSite: String,
        tstamp: {
            type: Date,
            default: Date.now
        },
        contacts: [{
            type: Schema.Types.ObjectId,
            ref: 'contactPerson'
        }],
        offers: [{
            type: Schema.Types.ObjectId,
            ref: 'offer'
        }],
        deleted: {
            type: Boolean,
            default: false
        }
    },
    {
        usePushEach: true
    });

ClientSchema.statics.findOffer = function (id) {
    return this.findById(id)
        .populate({
            path: 'offers',
            match: {
                deleted: false
            }
        })
        .then(client => client.offers);
};

ClientSchema.statics.findContactPerson = function (id) {
    return this.findById(id)
        .populate({
            path: 'contacts',
            match: {
                deleted: false
            }
        })
        .then(client => client.contacts);
};

ClientSchema.statics.createClient = function (args) {
    const Client = mongoose.model('client');
    const ContactPerson = mongoose.model('contactPerson');
    const contacts = args.contacts;
    let contactsArray = [];

    return (new Client({
        companyName: args.companyName,
        address: args.address,
        webSite: args.webSite,
        contacts: [],
        offers: args.offers
    })).save().then(client => {

        for (let c in contacts) {
            if (contacts.length > 0) {
                let contactPerson = new ContactPerson({
                    contactPerson: contacts[c].contactPerson,
                    contactPhone: contacts[c].contactPhone,
                    mobile: contacts[c].mobile,
                    mail: contacts[c].mail,
                });
                contactPerson.save().then((res) => {
                    ContactPerson.findOneAndUpdate({_id: res._id},
                        {
                            $push: {
                                client: client._id,
                            }
                        }, {new: true}).then((data) => data);

                    res.save();
                });
                contactsArray.push(contactPerson);
            }
        }

        return Promise.all([contactsArray, client.save()])
            .then(([contactsArray, client]) => {
                client.contacts = contactsArray;
                client.save();
                return client
            });
    });
};

ClientSchema.statics.updateClient = function (args) {
    const Client = mongoose.model('client');
    const ContactPerson = mongoose.model('contactPerson');
    const contacts = args.contacts;
    let contactsArray = [];

    return Client.findOneAndUpdate({_id: args.id}, {
        $set: {
            companyName: args.companyName,
            address: args.address,
            webSite: args.webSite,
        }
    }, {new: true}).then(client => {

            for (let c in contacts) {
                if (contacts.length > 0) {

                    if ( contacts[c].newPerosn || !contacts[c]._id) {
                        let contactPerson = new ContactPerson({
                            contactPerson: contacts[c].contactPerson,
                            contactPhone: contacts[c].contactPhone,
                            mobile: contacts[c].mobile,
                            mail: contacts[c].mail,
                        });
                        contactPerson.save().then((res) => {
                            ContactPerson.findOneAndUpdate({_id: res._id},
                                {
                                    $push: {
                                        client: client._id,
                                    }
                                }, {new: true}).then((data) => data);

                            res.save();
                        });
                        contactsArray.push(contactPerson._id);
                    }
                    else {
                        ContactPerson.findOneAndUpdate({_id: contacts[c]._id},
                            {
                                $set: {
                                    contactPerson: contacts[c].contactPerson,
                                    contactPhone: contacts[c].contactPhone,
                                    mobile: contacts[c].mobile,
                                    mail: contacts[c].mail,
                                    deleted: contacts[c].deleted
                                }
                            }, {new: true}).then((data) => data);
                    }
                }
            }

            return Promise.all([contactsArray, client.save()])
                .then(([contactsArray, client]) => {

                    for (let e in contactsArray) {
                        client.contacts.push(contactsArray[e]);
                    }
                    client.save();
                    return client
                });
        }
    );
};


mongoose.model('client', ClientSchema);