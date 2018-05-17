const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OfferSchema = new Schema({
        id: String,
        offerNumber: String,
        offerTitle: String,
        bodytext: String,
        totalPrice: Number,
        signedPrice: {
            type: Number,
            default: 0
        },
        tstamp: {
            type: Date,
            default: Date.now
        },
        expDate: Date,
        signed: {
            type: Boolean,
            default: false
        },
        client: [{
            type: Schema.Types.ObjectId,
            ref: 'client'
        }],
        contacts: Array,
        groups: [{
            type: Schema.Types.ObjectId,
            ref: 'group'
        }],
        pages: [{
            type: Schema.Types.ObjectId,
            ref: 'page'
        }],
        files: Array,
        sealer: [{
            type: Schema.Types.ObjectId,
            ref: 'sealer'
        }],
        internalHours: {
            type: Number,
            default: 0
        },
        externalHours: {
            type: Number,
            default: 0
        },
        comments: {
            type: String,
            default: "<h4>Bemerkungen</h4><ul><li>Alle Preise sind in Schweizer Franken exkl. Mehrwertsteuer angegeben.</li><li>Konditionen einmalige Kosten: 50% f&auml;llig nach Abschluss des Vertrags; Restbetrag f&auml;llig 12 Wochen nach Projektstart (Kickoff Meeting).</li><li>Die Nutzungsrechte sind f&uuml;r den Gebrauch der Webl&ouml;sung abgegolten.</li><li>Diese Offerte beh&auml;lt ihre G&uuml;ltigkeit bis zum 31. Juli 2017.</li><li>Alle Inhalte (Texte, Bilder, Logos) werden vom Kunden in digitaler Form sp&auml;testens eine Woche vor der Content-Eingabe geliefert.</li><li>Einmalige Content-Eingabe ist im Preis inbegriffen. Nachtr&auml;gliches Hinzuf&uuml;gen oder &Auml;ndern des Inhaltes wird nach Aufwand verrechnet.</li><li>Erst mit der vollst&auml;ndigen Bezahlung des vertraglich festgesetzten Preises wird das Nutzungsrecht erworben.</li></ul>"
        },
        version: {
            type: Number,
            default: 1.0
        },
        timeline: {
            type: Object,
            default: {}
        },
        deleted: {
            type: Boolean,
            default: false
        }
    },
    {
        usePushEach: true
    });

OfferSchema.statics.findClient = function (id) {

    return this.findById(id)
        .populate({
            path: 'client',
            match: {
                deleted: false
            }
        }).then(offer => offer.client);
};

OfferSchema.statics.findGroups = function (id) {
    return this.findById(id)
        .populate({
            path: 'groups',
            match: {
                deleted: false
            }
        })
        .then(offer => offer.groups);
};

OfferSchema.statics.findPages = function (id) {
    return this.findById(id)
        .populate({
            path: 'pages',
            match: {
                deleted: false
            }
        })
        .then(offer => offer.pages);
};

OfferSchema.statics.findSealer = function (id) {
    return this.findById(id)
        .populate('sealer')
        .then(offer => offer.sealer);
};

OfferSchema.statics.createOffer = function (args) {
    const Offer = mongoose.model('offer');
    const Group = mongoose.model('group');
    const Client = mongoose.model('client');
    const Module = mongoose.model('module');
    const Page = mongoose.model('page');
    const GroupsNew = args.groupsNew;

    return this.count().then((count) => {
        args.offerNumber = '00' + (parseInt(count) + 1) + '/' + new Date().getFullYear();

        return (new Offer(args)).save().then(offer => {
            Client.findOneAndUpdate({_id: args.client},
                {
                    $push: {
                        offers: offer._id,
                    }
                }, {new: true}).then((res) => res);

            for (let e in GroupsNew) {
                if (GroupsNew.length > 0) {
                    // create new group
                    if (GroupsNew[e].type === 1) {
                        let group = new Group({
                            name: GroupsNew[e].name,
                            subTotal: GroupsNew[e].subTotal,
                            total: GroupsNew[e].total,
                            order: GroupsNew[e].order,
                            summary: GroupsNew[e].summary
                        });
                        group.save().then((res) => {
                            for (let m in GroupsNew[e].modules) {
                                if (GroupsNew[e].modules[m].moduleNew) {
                                    // create new modules form modules array
                                    let module = new Module({
                                        name: GroupsNew[e].modules[m].name,
                                        bodytext: GroupsNew[e].modules[m].bodytext,
                                        price: GroupsNew[e].modules[m].price,
                                        groupId: group._id,
                                        categoryId: GroupsNew[e].modules[m].categoryId,
                                        moduleNew: false,
                                        internalHours: GroupsNew[e].modules[m].internalHours,
                                        externalHours: GroupsNew[e].modules[m].externalHours,
                                        pricePerHour: GroupsNew[e].modules[m].pricePerHour,
                                        signed: GroupsNew[e].modules[m].signed
                                    });
                                    module.save();
                                    res.modules.push(module);
                                }
                            }
                            res.save()
                        });
                        offer.groups.push(group);
                    }
                    // create new page from pages array
                    else if (GroupsNew[e].type === 2) {
                        let page = new Page({
                            type: GroupsNew[e].type,
                            pageType: GroupsNew[e].pageType,
                            title: GroupsNew[e].title,
                            subtitle: GroupsNew[e].subtitle,
                            bodytext: GroupsNew[e].bodytext,
                            defaultPage: false,
                            order: GroupsNew[e].order,
                            files: GroupsNew[e].files,
                            legal: GroupsNew[e].legal
                        });
                        page.save().then((res) => res);
                        offer.pages.push(page);
                    }
                }
            }
            return Promise.all([offer.save()])
                .then(([offer]) => offer);
        });
    });
};

OfferSchema.statics.updateOffer = function (args) {
    const Group = mongoose.model('group');
    const Client = mongoose.model('client');
    const Module = mongoose.model('module');
    const Page = mongoose.model('page');
    const GroupsNew = args.groupsNew;

    if (args.oldClient !== args.client) {
        // Unset offer client
        Client.findOneAndUpdate({_id: args.oldClient},
            {
                $pull: {
                    offers: args.id,
                }
            }, {new: true}).then((res) => res);
    }

    return this.findOneAndUpdate({_id: args.id},
        {
            $set: {
                offerNumber: args.offerNumber,
                offerTitle: args.offerTitle,
                totalPrice: args.totalPrice,
                signedPrice: args.signedPrice,
                bodytext: args.bodytext,
                client: args.client,
                contacts: args.contacts,
                sealer: args.sealer,
                tstamp: args.tstamp,
                expDate: args.expDate,
                signed: args.signed,
                internalHours: args.internalHours,
                externalHours: args.externalHours,
                comments: args.comments,
                files: args.files,
                timeline: args.timeline
            }
        }, {new: true}).then(offer => {

        // Set new offer client
        Client.findOneAndUpdate({_id: args.client},
            {
                $addToSet: {
                    offers: offer._id,
                }
            }, {new: true}).then((res) => res);

        for (let e in GroupsNew) {
            if (GroupsNew.length > 0) {

                if (GroupsNew[e].type === 1) {
                    // create new group
                    if (GroupsNew[e].groupNew) {
                        let group = new Group({
                            name: GroupsNew[e].name,
                            subTotal: GroupsNew[e].subTotal,
                            total: GroupsNew[e].total,
                            order: GroupsNew[e].order,
                            summary: GroupsNew[e].summary
                        });
                        group.save().then((res) => {
                            for (let m in GroupsNew[e].modules) {
                                if (GroupsNew[e].modules[m].moduleNew) {
                                    // create new modules form modules array
                                    let module = new Module({
                                        name: GroupsNew[e].modules[m].name,
                                        bodytext: GroupsNew[e].modules[m].bodytext,
                                        price: GroupsNew[e].modules[m].price,
                                        groupId: group._id,
                                        categoryId: GroupsNew[e].modules[m].categoryId[0]._id,
                                        moduleNew: false,
                                        internalHours: GroupsNew[e].modules[m].internalHours,
                                        externalHours: GroupsNew[e].modules[m].externalHours,
                                        pricePerHour: GroupsNew[e].modules[m].pricePerHour,
                                        signed: GroupsNew[e].modules[m].signed
                                    });
                                    module.save();
                                    res.modules.push(module);
                                }
                            }
                            res.save()
                        });
                        offer.groups.push(group);
                    }
                    else {
                        Group.findOneAndUpdate({_id: GroupsNew[e]._id},
                            {
                                $set: {
                                    name: GroupsNew[e].name,
                                    subTotal: GroupsNew[e].subTotal,
                                    total: GroupsNew[e].total,
                                    order: GroupsNew[e].order,
                                    deleted: GroupsNew[e].deleted,
                                    summary: GroupsNew[e].summary
                                }
                            }, {new: true}).then((res) => {
                            for (let m in GroupsNew[e].modules) {
                                if (GroupsNew[e].modules[m].moduleNew) {
                                    // create new modules form modules array
                                    let module = new Module({
                                        name: GroupsNew[e].modules[m].name,
                                        bodytext: GroupsNew[e].modules[m].bodytext,
                                        price: GroupsNew[e].modules[m].price,
                                        groupId: res._id,
                                        categoryId: GroupsNew[e].modules[m].categoryId[0]._id,
                                        moduleNew: false,
                                        internalHours: GroupsNew[e].modules[m].internalHours,
                                        externalHours: GroupsNew[e].modules[m].externalHours,
                                        pricePerHour: GroupsNew[e].modules[m].pricePerHour,
                                        signed: GroupsNew[e].modules[m].signed
                                    });
                                    module.save();
                                    res.modules.push(module);
                                }
                                else {
                                    Module.findOneAndUpdate({_id: GroupsNew[e].modules[m]._id},
                                        {
                                            $set: {
                                                name: GroupsNew[e].modules[m].name,
                                                bodytext: GroupsNew[e].modules[m].bodytext,
                                                price: GroupsNew[e].modules[m].price,
                                                groupId: res._id,
                                                categoryId: GroupsNew[e].modules[m].categoryId[0]._id,
                                                moduleNew: false,
                                                deleted: GroupsNew[e].modules[m].deleted,
                                                internalHours: GroupsNew[e].modules[m].internalHours,
                                                externalHours: GroupsNew[e].modules[m].externalHours,
                                                pricePerHour: GroupsNew[e].modules[m].pricePerHour,
                                                signed: GroupsNew[e].modules[m].signed
                                            }
                                        }, {new: true}).then((res) => res).catch(err => console.log(err));
                                }
                            }
                            res.save()
                        }).catch(err => console.log(err));
                    }

                }
                // create new page from pages array
                else if (GroupsNew[e].type === 2) {

                    if (GroupsNew[e].pageNew) {
                        let page = new Page({
                            type: GroupsNew[e].type,
                            pageType: GroupsNew[e].pageType,
                            title: GroupsNew[e].title,
                            subtitle: GroupsNew[e].subtitle,
                            bodytext: GroupsNew[e].bodytext,
                            defaultPage: false,
                            order: GroupsNew[e].order,
                            files: GroupsNew[e].files,
                            legal: GroupsNew[e].legal
                        });
                        page.save().then((res) => res);
                        offer.pages.push(page);
                    }
                    else {
                        Page.findOneAndUpdate({_id: GroupsNew[e]._id},
                            {
                                $set: {
                                    type: GroupsNew[e].type,
                                    title: GroupsNew[e].title,
                                    subtitle: GroupsNew[e].subtitle,
                                    bodytext: GroupsNew[e].bodytext,
                                    defaultPage: false,
                                    order: GroupsNew[e].order,
                                    deleted: GroupsNew[e].deleted,
                                    files: GroupsNew[e].files,
                                    legal: GroupsNew[e].legal
                                }
                            }, {new: true}).then((res) => res);
                    }
                }
            }
        }
        return Promise.all([offer.save()])
            .then(([offer]) => offer);
    });
};

OfferSchema.statics.copyOffer = function (args) {
    const Offer = mongoose.model('offer');
    const Group = mongoose.model('group');
    const Client = mongoose.model('client');
    const Module = mongoose.model('module');
    const Page = mongoose.model('page');

    return this.count().then((count) => {
        let offerNumber = '00' + (parseInt(count) + 1) + '/' + new Date().getFullYear();

        return this.findById(args.id).then(doc => {
            let version = doc.version + 1;
            let copyGroups = [];
            let newGroup = [];
            let newPage = [];
            let copyPages = [];

            for (let element in doc.groups) {
                if (mongoose.Types.ObjectId.isValid(doc.groups[element])) {
                    copyGroups.push(doc.groups[element])
                }
            }

            for (let page in doc.pages) {
                if (mongoose.Types.ObjectId.isValid(doc.pages[page])) {
                    copyPages.push(doc.pages[page])
                }
            }

            let copyData = {
                offerTitle: doc.offerTitle + ' (Copy ' + version + ')',
                offerNumber: offerNumber,
                totalPrice: doc.totalPrice,
                signedPrice: doc.signedPrice,
                expDate: doc.expDate,
                bodytext: doc.bodytext,
                client: args.client,
                contacts: doc.contacts,
                sealer: doc.sealer,
                signed: doc.signed,
                internalHours: doc.internalHours,
                externalHours: doc.externalHours,
                comments: doc.comments,
                version: version,
                timeline: doc.timeline,
                groups: []
            };

            return (new Offer(copyData)).save().then(offer => {

                Client.findOneAndUpdate({_id: args.client},
                    {
                        $push: {
                            offers: offer._id,
                        }
                    }, {new: true}).then((res) => res);

                for (let g in copyGroups) {
                    Group.find({_id: copyGroups[g], deleted: false}).then(data => {
                        if (data) {
                            let group = new Group({
                                name: data[0].name,
                                subTotal: data[0].subTotal,
                                total: data[0].total,
                                order: data[0].order,
                                summary: data[0].summary,
                                type: data[0].type,
                                groupNew: data[0].groupNew,
                                defaultGroup: data[0].defaultGroup,
                                modules: [],
                                deleted: data[0].deleted
                            });

                            group.save().then((res) => {
                                for (let m in data[0].modules) {
                                    if (mongoose.Types.ObjectId.isValid(data[0].modules[m])) {
                                        Module.find({_id: data[0].modules[m], deleted: false}).then(item => {
                                            item[0]._id = mongoose.Types.ObjectId();
                                            item[0].isNew = true; //<--------------------IMPORTANT
                                            item[0].save().then(newModule => {
                                                Group.findOneAndUpdate({_id: res._id},
                                                    {
                                                        $push: {
                                                            modules: newModule._id,
                                                        }
                                                    }, {new: true}).then((res) => res);
                                            });
                                        });
                                    }
                                }
                                res.save();
                            });
                            newGroup.push(group);
                        }
                    });
                }

                for (let p in copyPages) {
                    Page.find({_id: copyPages[p], deleted: false}).then(pageData => {
                        if (pageData) {
                            let page = new Page({
                                type: pageData[0].type,
                                pageType: pageData[0].pageType,
                                title: pageData[0].title,
                                subtitle: pageData[0].subtitle,
                                bodytext: pageData[0].bodytext,
                                defaultPage: false,
                                order: pageData[0].order,
                                files: pageData[0].files,
                                legal: pageData[0].legal
                            });

                            page.save();
                            newPage.push(page);
                        }
                    });
                }

                setTimeout(function () {
                    return Promise.all([newGroup, newPage, offer])
                        .then(([newGroup, newPage, offer]) => {
                            offer.groups = newGroup;
                            offer.pages = newPage;
                            offer.save();
                            return offer
                        });
                }, 500);

            });
        });
    });
};

mongoose.model('offer', OfferSchema);