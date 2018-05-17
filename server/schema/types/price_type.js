const mongoose = require('mongoose');
const graphql = require('graphql');
const {GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList, GraphQLInt, GraphQLBoolean} = graphql;
const GraphQLDate = require('graphql-date');

const PriceType = new GraphQLObjectType({
    name: 'PriceType',
    fields: () => ({
        _id: {type: GraphQLID},
        value: {type: GraphQLInt},
        tstamp: {type: GraphQLDate},
        deleted: {type: GraphQLBoolean}
    })
});

module.exports = PriceType;
