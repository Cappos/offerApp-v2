const graphql = require('graphql');
const {GraphQLObjectType, GraphQLString, GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLFloat, GraphQLList, GraphQLBoolean} = graphql;
const GraphQLJSON = require('graphql-type-json');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Sealer = mongoose.model('sealer');
const SealerType = require('./types/sealer_type');
const Module = mongoose.model('module');
const ModuleType = require('./types/module_type');
const CategoryType = require('./types/category_type');
const Category = mongoose.model('category');
const ClientType = require('./types/client_type');
const Client = mongoose.model('client');
const GroupType = require('./types/group_type');
const Group = mongoose.model('group');
const PageType = require('./types/page_type');
const Page = mongoose.model('page');
const OfferType = require('./types/offer_type');
const Offer = mongoose.model('offer');
const PriceType = require('./types/price_type');
const Price = mongoose.model('price');
const UserType = require('./types/user_type');
const User = mongoose.model('user');
const ContactPersonType = require('./types/contactPerson_type');
const ContactPerson = mongoose.model('contactPerson');


const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addSealer: {
            type: SealerType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                position: {type: GraphQLString},
                title: {type: GraphQLString},
                email: {type: new GraphQLNonNull(GraphQLString)},
                phone: {type: GraphQLString},
                mobile: {type: GraphQLString},
                value: {type: new GraphQLNonNull(GraphQLInt)}
            },
            resolve(parentValue, args) {
                return (new Sealer(args)).save()
            }
        },
        deleteSealer: {
            type: SealerType,
            args: {id: {type: new GraphQLNonNull(GraphQLID)}},
            resolve(parentValue, {id}) {
                return Sealer.findOneAndUpdate({_id: id}, {
                    $set: {
                        deleted: true
                    }
                }, {new: true});
            }
        },
        editSealer: {
            type: SealerType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)},
                position: {type: GraphQLString},
                title: {type: GraphQLString},
                name: {type: new GraphQLNonNull(GraphQLString)},
                email: {type: new GraphQLNonNull(GraphQLString)},
                phone: {type: GraphQLString},
                mobile: {type: GraphQLString}
            },
            resolve(parentValue, args) {
                return Sealer.findOneAndUpdate({_id: args.id}, {
                    $set: {
                        position: args.position,
                        title: args.title,
                        name: args.name,
                        email: args.email,
                        phone: args.phone,
                        mobile: args.mobile
                    }
                }, {new: true});
            }
        },
        addModule: {
            type: ModuleType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                bodytext: {type: GraphQLString},
                price: {type: GraphQLFloat},
                tstmp: {type: GraphQLString},
                groupId: {type: GraphQLID},
                categoryId: {type: GraphQLID},
                moduleNew: {type: GraphQLBoolean},
                internalHours: {type: GraphQLFloat},
                externalHours: {type: GraphQLFloat},
                pricePerHour: {type: GraphQLInt},
                defaultModule: {type: GraphQLBoolean},
                signed: {type: GraphQLBoolean}
            },
            resolve(parentValue, args) {
                return (new Module(args)).save()
            }
        },
        editModule: {
            type: ModuleType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)},
                name: {type: new GraphQLNonNull(GraphQLString)},
                bodytext: {type: GraphQLString},
                price: {type: GraphQLFloat},
                tstmp: {type: GraphQLString},
                groupId: {type: GraphQLID},
                internalHours: {type: GraphQLFloat},
                externalHours: {type: GraphQLFloat},
                pricePerHour: {type: GraphQLInt},
                categoryId: {type: GraphQLID},
                signed: {type: GraphQLBoolean}

            },
            resolve(parentValue, args) {
                return Module.findOneAndUpdate({_id: args.id}, {
                    $set: {
                        name: args.name,
                        bodytext: args.bodytext,
                        price: args.price,
                        groupId: args.groupId,
                        categoryId: args.categoryId,
                        internalHours: args.internalHours,
                        externalHours: args.externalHours,
                        pricePerHour: args.pricePerHour,
                        signed: args.signed
                    }
                }, {new: true});
            }
        },
        deleteModule: {
            type: ModuleType,
            args: {id: {type: new GraphQLNonNull(GraphQLID)}},
            resolve(parentValue, {id}) {
                return Module.findOneAndUpdate({_id: id}, {
                    $set: {
                        deleted: true
                    }
                }, {new: true});
            }
        },
        addCategory: {
            type: CategoryType,
            args: {
                name: {type: GraphQLString},
                value: {type: GraphQLString},
                tstamp: {type: GraphQLString}
            },
            resolve(parentValue, args) {
                return Category.addCategory(args);
            }
        },
        editCategory: {
            type: CategoryType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)},
                name: {type: new GraphQLNonNull(GraphQLString)},
                tstmp: {type: GraphQLString}
            },
            resolve(parentValue, args) {
                return Category.updateCategory(args);
            }
        },
        deleteCategory: {
            type: CategoryType,
            args: {id: {type: new GraphQLNonNull(GraphQLID)}},
            resolve(parentValue, {id}) {
                return Category.findOneAndUpdate({_id: id}, {
                    $set: {
                        deleted: true
                    }
                }, {new: true});
            }
        },
        addClient: {
            type: ClientType,
            args: {
                companyName: {type: GraphQLString},
                address: {type: GraphQLString},
                webSite: {type: GraphQLString},
                tstmp: {type: GraphQLString},
                contacts: {type: GraphQLJSON},
                offers: {type: GraphQLID}
            },
            resolve(parentValue, args) {
                return Client.createClient(args);
            }
        },
        editClient: {
            type: ClientType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)},
                companyName: {type: new GraphQLNonNull(GraphQLString)},
                address: {type: GraphQLString},
                webSite: {type: GraphQLString},
                tstmp: {type: GraphQLString},
                contacts: {type: GraphQLJSON},
                offers: {type: GraphQLJSON}
            },
            resolve(parentValue, args) {
                return Client.updateClient(args);
            }
        },
        deleteClient: {
            type: ClientType,
            args: {id: {type: new GraphQLNonNull(GraphQLID)}},
            resolve(parentValue, {id}) {
                return Client.findOneAndUpdate({_id: id}, {
                    $set: {
                        deleted: true
                    }
                }, {new: true});
            }
        },
        addGroup: {
            type: GroupType,
            args: {
                name: {type: GraphQLString},
                subTotal: {type: GraphQLFloat},
                total: {type: GraphQLFloat},
                tstamp: {type: GraphQLString},
                order: {type: GraphQLInt},
                modulesNew: {type: GraphQLJSON},
                groupNew: {type: GraphQLBoolean},
                summary: {type: GraphQLBoolean},
            },
            resolve(parentValue, args) {
                return Group.createGroup(args);
            }
        },
        editGroup: {
            type: GroupType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)},
                name: {type: new GraphQLNonNull(GraphQLString)},
                subTotal: {type: GraphQLFloat},
                total: {type: GraphQLFloat},
                modulesNew: {type: GraphQLJSON},
                summary: {type: GraphQLBoolean},
            },
            resolve(parentValue, args) {
                return Group.updateGroup(args);
            }
        },
        deleteGroup: {
            type: GroupType,
            args: {id: {type: new GraphQLNonNull(GraphQLID)}},
            resolve(parentValue, {id}) {
                return Group.findOneAndUpdate({_id: id}, {
                    $set: {
                        deleted: true
                    }
                }, {new: true});
            }
        },
        addPage: {
            type: PageType,
            args: {
                type: {type: GraphQLInt},
                pageType: {type: GraphQLInt},
                title: {type: GraphQLString},
                subtitle: {type: GraphQLString},
                bodytext: {type: GraphQLString},
                tstamp: {type: GraphQLString},
                order: {type: GraphQLInt},
                pageNew: {type: GraphQLBoolean},
                files: {type: GraphQLJSON},
                legal: {type: GraphQLBoolean}
            },
            resolve(parentValue, args) {
                return (new Page(args)).save()
            }
        },
        deletePage: {
            type: PageType,
            args: {id: {type: new GraphQLNonNull(GraphQLID)}},
            resolve(parentValue, {id}) {
                return Page.findOneAndUpdate({_id: id}, {
                    $set: {
                        deleted: true
                    }
                }, {new: true});
            }
        },
        editPage: {
            type: PageType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)},
                title: {type: new GraphQLNonNull(GraphQLString)},
                pageType: {type: GraphQLInt},
                subtitle: {type: GraphQLString},
                bodytext: {type: GraphQLString},
                files: {type: GraphQLJSON},
                legal: {type: GraphQLBoolean}
            },
            resolve(parentValue, args) {
                return Page.findOneAndUpdate({_id: args.id}, {
                    $set: {
                        title: args.title,
                        subtitle: args.subtitle,
                        bodytext: args.bodytext,
                        files: args.files,
                        legal: args.legal
                    }
                }, {new: true});
            }
        },
        addOffer: {
            type: OfferType,
            args: {
                offerTitle: {type: new GraphQLNonNull(GraphQLString)},
                offerNumber: {type: GraphQLString},
                totalPrice: {type: GraphQLFloat},
                signedPrice: {type: GraphQLFloat},
                tstamp: {type: GraphQLString},
                expDate: {type: GraphQLString},
                bodytext: {type: GraphQLString},
                client: {type: GraphQLID},
                contacts: {type: GraphQLJSON},
                sealer: {type: GraphQLID},
                groups: {type: GraphQLID},
                groupsNew: {type: GraphQLJSON},
                files: {type: GraphQLJSON},
                internalHours: {type: GraphQLFloat},
                externalHours: {type: GraphQLFloat},
                comments: { type: GraphQLString },
                timeline: {type: GraphQLJSON}
            },
            resolve(parentValue, args) {
                return Offer.createOffer(args);
            }
        },
        editOffer: {
            type: OfferType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)},
                offerTitle: {type: new GraphQLNonNull(GraphQLString)},
                offerNumber: {type: GraphQLString},
                totalPrice: {type: GraphQLFloat},
                signedPrice: {type: GraphQLFloat},
                tstamp: {type: GraphQLString},
                expDate: {type: GraphQLString},
                bodytext: {type: GraphQLString},
                client: {type: GraphQLID},
                contacts: {type: GraphQLJSON},
                sealer: {type: GraphQLID},
                signed: {type: GraphQLBoolean},
                groups: {type: GraphQLID},
                groupsNew: {type: GraphQLJSON},
                files: {type: GraphQLJSON},
                oldClient: {type: GraphQLID},
                oldSeller: {type: GraphQLID},
                internalHours: {type: GraphQLFloat},
                externalHours: {type: GraphQLFloat},
                comments: { type: GraphQLString },
                timeline: {type: GraphQLJSON}
            },
            resolve(parentValue, args) {
                return Offer.updateOffer(args);
            }
        },
        deleteOffer: {
            type: OfferType,
            args: {id: {type: new GraphQLNonNull(GraphQLID)}},
            resolve(parentValue, {id}) {
                return Offer.findOneAndUpdate({_id: id}, {
                    $set: {
                        deleted: true
                    }
                }, {new: true});
            }
        },
        copyOffer: {
            type: OfferType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)},
                client: {type: new GraphQLNonNull(GraphQLID)}
            },
            resolve(parentValue, args) {
                return Offer.copyOffer(args);
            }
        },
        addPrice: {
            type: PriceType,
            args: {
                value: {type: new GraphQLNonNull(GraphQLInt)}
            },
            resolve(parentValue, args) {
                return (new Price(args)).save()
            }
        },
        deletePrice: {
            type: PriceType,
            args: {id: {type: new GraphQLNonNull(GraphQLID)}},
            resolve(parentValue, {id}) {
                return Price.findOneAndUpdate({_id: id}, {
                    $set: {
                        deleted: true
                    }
                }, {new: true});
            }
        },
        editPrice: {
            type: PriceType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)},
                value: {type: new GraphQLNonNull(GraphQLInt)}
            },
            resolve(parentValue, args) {
                return Price.findOneAndUpdate({_id: args.id}, {
                    $set: {
                       value: args.value
                    }
                }, {new: true});
            }
        },
        addUser: {
            type: UserType,
            args: {
                username: {type: new GraphQLNonNull(GraphQLString)},
                password: {type: new GraphQLNonNull(GraphQLString)},
                email: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parentValue, args) {
                return User.addNewUser(args)
            }
        },
        deleteUser: {
            type: UserType,
            args: {id: {type: new GraphQLNonNull(GraphQLID)}},
            resolve(parentValue, {id}) {
                return User.findOneAndUpdate({_id: id}, {
                    $set: {
                        deleted: true
                    }
                }, {new: true});
            }
        },
        editUser: {
            type: UserType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)},
                username: {type: new GraphQLNonNull(GraphQLString)},
                password: {type: new GraphQLNonNull(GraphQLString)},
                email: {type: new GraphQLNonNull(GraphQLString)},
                deleted: {type: GraphQLBoolean},
                superAdmin: {type: GraphQLBoolean}
            },
            resolve(parentValue, args) {
                const password = bcrypt.hashSync(args.password, 10);
                return User.findOneAndUpdate({_id: args.id}, {
                    $set: {
                        username: args.username,
                        password: password,
                        email: args.email,
                        deleted: args.deleted,
                        superAdmin: args.superAdmin
                    }
                }, {new: true});
            }
        },
    }
});

module.exports = mutation;
