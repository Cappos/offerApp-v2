const mongoose = require('mongoose');
const graphql = require('graphql');
const {GraphQLObjectType, GraphQLList, GraphQLID, GraphQLNonNull} = graphql;
const GraphQLJSON = require('graphql-type-json');
const OfferType = require('./types/offer_type');
const SealerType = require('./types/sealer_type');
const Offer = mongoose.model('offer');
const Sealer = mongoose.model('sealer');
const ModuleType = require('./types/module_type');
const Module = mongoose.model('module');
const GroupType = require('./types/group_type');
const Group = mongoose.model('group');
const CategoryType = require('./types/category_type');
const Category = mongoose.model('category');
const ClientType =  require('./types/client_type');
const Client = mongoose.model('client');
const PageType =  require('./types/page_type');
const Page = mongoose.model('page');
const PriceType = require('./types/price_type');
const Price = mongoose.model('price');
const UserType = require('./types/user_type');
const User = mongoose.model('user');
const ContactPersonType = require('./types/contactPerson_type');
const ContactPerson = mongoose.model('contactPerson');


const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: () => ({
        offers: {
            type: new GraphQLList(OfferType),
            resolve(parentValue) {
                return Offer.find({deleted: false});
            }
        },
        offer: {
            type: OfferType,
            args: {_id: {type: new GraphQLNonNull(GraphQLID)}},
            resolve(parentValue, {_id}) {
                return Offer.findById({_id: _id});
            }
        },
        sealers: {
            type: new GraphQLList(SealerType),
            resolve(parentValue) {
                return Sealer.find({deleted: false});
            }
        },
        modules: {
            type: new GraphQLList(ModuleType),
            resolve(parentValue) {
                return Module.find({defaultModule: true, deleted: false});
            }
        },
        module: {
            type: ModuleType,
            args: {id: {type: new GraphQLNonNull(GraphQLID)}},
            resolve(parentValue, {id}) {
                return Module.findById({_id: id});
            }
        },
        groups: {
            type: new GraphQLList(GroupType),
            resolve(parentValue) {
                return Group.find({defaultGroup: true, deleted: false});
            }
        },
        group: {
            type: GroupType,
            args: {id: {type: new GraphQLNonNull(GraphQLID)}},
            resolve(parentValue, {id}) {
                return Group.findById({_id: id});
            }
        },
        categories: {
            type: new GraphQLList(CategoryType),
            resolve(parentValue) {
                return Category.find({deleted: false});
            }
        },
        category: {
            type: CategoryType,
            args: {id: {type: new GraphQLNonNull(GraphQLID)}},
            resolve(parentValue, {id}) {
                return Category.findById({_id: id});
            }
        },
        clients: {
            type: new GraphQLList(ClientType),
            resolve(parentValue) {
                return Client.find({deleted: false});
            }
        },
        client: {
            type: ClientType,
            args: {id: {type: new GraphQLNonNull(GraphQLID)}},
            resolve(parentValue, {id}) {
                return Client.findById({_id: id});
            }
        },
        contacts: {
            type:  new GraphQLList(ContactPersonType),
            args: {id: {type: GraphQLJSON}},
            resolve(parentValue, {id}) {
                return ContactPerson.find({_id: { $in: id} });
            }
        },
        contactPersons: {
            type: new GraphQLList(ContactPersonType),
            resolve(parentValue) {
                return ContactPerson.find({deleted: false});
            }
        },
        contactPerson: {
            type: ContactPersonType,
            args: {id: {type: new GraphQLNonNull(GraphQLID)}},
            resolve(parentValue, {id}) {
                return ContactPerson.findById({_id: id});
            }
        },
        pages: {
            type: new GraphQLList(PageType),
            resolve(parentValue) {
                return Page.find({deleted: false, defaultPage: true});
            }
        },
        page: {
            type: PageType,
            args: {id: {type: new GraphQLNonNull(GraphQLID)}},
            resolve(parentValue, {id}) {
                return Page.findById({_id: id});
            }
        },
        dashboardOffers: {
            type: new GraphQLList(OfferType),
            resolve(parentValue) {
                return Offer.find({deleted: false}).sort('-date').limit(5);
            }
        },
        dashboardClients: {
            type: new GraphQLList(ClientType),
            resolve(parentValue) {
                return Client.find({deleted: false}).sort('-date').limit(5);
            }
        },
        prices: {
            type: new GraphQLList(PriceType),
            resolve(parentValue) {
                return Price.find({deleted: false});
            }
        },
        price: {
            type: new GraphQLList(PriceType),
            args: {id: {type: new GraphQLNonNull(GraphQLID)}},
            resolve(parentValue, {id}) {
                return Price.find({_id: id, deleted: false});
            }
        },
        users: {
            type: new GraphQLList(UserType),
            resolve(parentValue) {
                return User.find({deleted: false});
            }
        },
        user: {
            type: UserType,
            args: {id: {type: new GraphQLNonNull(GraphQLID)}},
            resolve(parentValue, {id}) {
                return User.findById({_id: id});
            }
        },
    })
});

module.exports = RootQuery;
