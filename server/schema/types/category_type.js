const mongoose = require('mongoose');
const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLInt} = graphql;
const GraphQLDate = require('graphql-date');
const Category = mongoose.model('category');

const CategoryType = new GraphQLObjectType({
  name:  'CategoryType',
  fields: () => ({
      _id: {type: GraphQLID},
      name: { type: GraphQLString },
      value: {type: GraphQLString},
      tstamp: {type: GraphQLDate},
      module: {
          type: require('./module_type'),
          resolve(parentValue) {
              return Category.findById(parentValue).populate('module')
                  .then(category => {
                      console.log(category);
                      return category.module
                  });
          }
      }
  })
});

module.exports = CategoryType;
