const mongoose = require('mongoose');
const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLBoolean, GraphQLList } = graphql;
const GraphQLDate = require('graphql-date');

const Client = mongoose.model('client');
const ContactPersonType = require('./contactPerson_type');

const ClientType = new GraphQLObjectType({
  name:  'ClientType',
  fields: () => {
      const Offer = require('./offer_type');
      return {
          _id: {type: GraphQLID},
          companyName:  { type: GraphQLString },
          address:  { type: GraphQLString },
          webSite:  { type: GraphQLString },
          tstamp: {type: GraphQLDate},
          contacts:  {
              type: new GraphQLList(ContactPersonType),
              resolve(parentValue) {
                  return Client.findContactPerson(parentValue._id);
              }
          },
          offers:  {
              type: new GraphQLList(Offer),
              resolve(parentValue) {
                  return Client.findOffer(parentValue._id);
              }
          },
          deleted: {type: GraphQLBoolean}
      }
  }
});

module.exports = ClientType;
