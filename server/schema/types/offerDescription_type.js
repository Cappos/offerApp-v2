const mongoose = require('mongoose');
const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList, GraphQLBoolean } = graphql;
const SealerType = require('./sealer_type');
const OfferDescription = mongoose.model('offerDescription');

const OfferDescriptionType = new GraphQLObjectType({
  name:  'OfferDescriptionType',
  fields: () => ({
      _id: {type: GraphQLID},
      offerTitle: {type: GraphQLString},
      sealer: {
          type: new GraphQLList(SealerType),
          resolve(parentValue, args) {
              console.log(parentValue, args);
          }
      },
      deleted: {type: GraphQLBoolean}
  })
});

module.exports = OfferDescriptionType;
