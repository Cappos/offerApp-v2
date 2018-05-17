const mongoose = require('mongoose');
const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList, GraphQLInt, GraphQLBoolean, GraphQLFloat } = graphql;
const GraphQLJSON = require('graphql-type-json');
const GraphQLDate = require('graphql-date');

const SelerType = require('./sealer_type');
const GroupType = require('./group_type');
const PageType = require('./page_type');
const Offer = mongoose.model('offer');


const OfferType = new GraphQLObjectType({
  name:  'OfferType',
  fields: () => {
      const ClientType = require('./client_type');
      return {
          _id: {type: GraphQLID},
          offerNumber: { type: GraphQLString },
          offerTitle: { type: GraphQLString },
          bodytext: { type: GraphQLString },
          totalPrice: { type: GraphQLInt },
          signedPrice: { type: GraphQLInt },
          tstamp: { type: GraphQLDate },
          expDate: { type: GraphQLDate },
          signed: {type: GraphQLBoolean},
          client: {
              type: new GraphQLList(ClientType),
              resolve(parentValue) {
                  return Offer.findClient(parentValue._id);
              }
          },
          contacts: {type: GraphQLJSON},
          groups: {
              type: new GraphQLList(GroupType),
              resolve(parentValue) {
                  return Offer.findGroups(parentValue._id);
              }
          },
          pages: {
              type: new GraphQLList(PageType),
              resolve(parentValue) {
                  return Offer.findPages(parentValue._id);
              }
          },
          files: {type: GraphQLJSON},
          sealer: {
              type: new GraphQLList(SelerType),
              resolve(parentValue) {
                  return Offer.findSealer(parentValue._id);
              }
          },
          internalHours: {type: GraphQLFloat},
          externalHours: {type: GraphQLFloat},
          comments: { type: GraphQLString },
          version: {type: GraphQLFloat},
          timeline: {type: GraphQLJSON},
          deleted: {type: GraphQLBoolean}
      }
  }
});

module.exports = OfferType;
