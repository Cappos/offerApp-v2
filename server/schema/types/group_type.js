const mongoose = require('mongoose');
const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList, GraphQLInt, GraphQLBoolean, GraphQLFloat } = graphql;
const GraphQLDate = require('graphql-date');
const ModuleType = require('./module_type');
const Group = mongoose.model('group');

const GroupType = new GraphQLObjectType({
  name:  'GroupType',
  fields: () => ({
      _id: {type: GraphQLID},
      name: {type: GraphQLString},
      subTotal: {type: GraphQLFloat},
      total: {type: GraphQLFloat},
      tstamp: {type: GraphQLDate},
      modules: {
          type: new GraphQLList(ModuleType),
          resolve(parentValue) {
              return Group.findModules(parentValue._id);
          }
      },
      type: {type: GraphQLInt},
      order: {type: GraphQLInt},
      groupNew: {type: GraphQLBoolean},
      defaultGroup: {type: GraphQLBoolean},
      summary: {type: GraphQLBoolean},
      deleted: {type: GraphQLBoolean}
  })
});

module.exports = GroupType;
