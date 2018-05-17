const mongoose = require('mongoose');
const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLBoolean, GraphQLList } = graphql;
const GraphQLDate = require('graphql-date');
const ContactPerson = mongoose.model('contactPerson');

const ContactPersonType = new GraphQLObjectType({
  name:  'ContactPersonType',
  fields: () => {
      const ClientType = require('./client_type');
      return {
          _id: {type: GraphQLID},
          contactPerson:  { type: GraphQLString },
          address:  { type: GraphQLString },
          contactPhone:  { type: GraphQLString },
          mobile:  { type: GraphQLString },
          mail:  { type: GraphQLString },
          client: {
              type: new GraphQLList(ClientType),
              resolve(parentValue) {
                  return ContactPerson.findClient(parentValue._id);
              }
          },
          tstamp: {type: GraphQLDate},
          deleted: {type: GraphQLBoolean}
      }
  }
});

module.exports = ContactPersonType;
