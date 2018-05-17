const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const async = require('async');

const GroupSchema = new Schema({
        id: String,
        name: String,
        subTotal: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            default: 0
        },
        tstamp: {
            type: Date,
            default: Date.now
        },
        modules: [{
            type: Schema.Types.ObjectId,
            ref: 'module'
        }],
        defaultGroup: {
            type: Boolean,
            default: false
        },
        type: {
            type: Number,
            default: 1
        },
        order: Number,
        groupNew: {
            type: Boolean,
            default: false
        },
        summary: {
            type: Boolean,
            default: true
        },
        deleted: {
            type: Boolean,
            default: false
        }
    },
    {
        usePushEach: true
    });

GroupSchema.statics.findModules = function (id) {
    return this.findById(id)
        .populate({
            path: 'modules',
            match: {
                deleted: false
            }
        })
        .then(group => group.modules);
};

GroupSchema.statics.updateGroup = function (args) {
    const Module = mongoose.model('module');

    if (args.modulesNew) {
        const ModulesNew = args.modulesNew;

        for (let e in ModulesNew) {
            this.findOneAndUpdate({_id: args.id},
                {
                    $set: {
                        name: args.name,
                        subTotal: args.subTotal,
                        total: args.total,
                        summary: args.summary
                    }
                }, {new: true})
                .then(chapter => {
                    if (ModulesNew[e].moduleNew && !ModulesNew[e].deleted) {

                        let module = new Module({
                            name: ModulesNew[e].name,
                            bodytext: ModulesNew[e].bodytext,
                            price: ModulesNew[e].price,
                            groupId: args.id,
                            categoryId: ModulesNew[e].categoryId,
                            moduleNew: false,
                            internalHours: ModulesNew[e].internalHours,
                            externalHours: ModulesNew[e].externalHours,
                            pricePerHour: ModulesNew[e].pricePerHour,
                            signed: ModulesNew[e].signed
                        });
                        chapter.modules.push(module);
                        return Promise.all([module.save(), chapter.save()])
                            .then(([module, chapter]) => chapter);
                    }
                    else {
                        if(!ModulesNew[e].moduleNew){
                            return Module.findOneAndUpdate({_id: ModulesNew[e]._id}, {
                                $set: {
                                    name: ModulesNew[e].name,
                                    bodytext: ModulesNew[e].bodytext,
                                    price: ModulesNew[e].price,
                                    groupId: ModulesNew[e].groupId,
                                    categoryId: ModulesNew[e].categoryId,
                                    deleted: ModulesNew[e].deleted,
                                    internalHours: ModulesNew[e].internalHours,
                                    externalHours: ModulesNew[e].externalHours,
                                    pricePerHour: ModulesNew[e].pricePerHour,
                                    signed: ModulesNew[e].signed
                                }
                            }, {new: true});
                        }

                    }
                });
        }
        return this.findById(args.id);
    }
    else {

        return this.findOneAndUpdate({_id: args.id},
            {
                $set: {
                    name: args.name,
                    subTotal: args.subTotal,
                    total: args.total
                }
            }, {new: true})
    }
};

GroupSchema.statics.createGroup = function (args) {
    const Module = mongoose.model('module');
    const Group = mongoose.model('group');
    const ModulesNew = args.modulesNew;
    args.defaultGroup = true;

    return (new Group(args)).save().then(chapter => {
        for (let e in ModulesNew) {
            if (ModulesNew[e].moduleNew) {
                let module = new Module({
                    name: ModulesNew[e].name,
                    bodytext: ModulesNew[e].bodytext,
                    price: ModulesNew[e].price,
                    groupId: chapter._id,
                    categoryId: ModulesNew[e].categoryId,
                    moduleNew: false,
                    internalHours: ModulesNew[e].internalHours,
                    externalHours: ModulesNew[e].externalHours,
                    pricePerHour: ModulesNew[e].pricePerHour,
                    signed: ModulesNew[e].signed
                });
                chapter.modules.push(module);
                module.save()
            }
        }
        return Promise.all([chapter.save()])
            .then(([chapter]) => chapter);
    });
};

mongoose.model('group', GroupSchema);