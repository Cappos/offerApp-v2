const mongoose = require('mongoose');
const graphql = require('graphql');
const {GraphQLObjectType, GraphQLString, GraphQLID, GraphQLInt, GraphQLBoolean} = graphql;
const GraphQLDate = require('graphql-date');
const GraphQLJSON = require('graphql-type-json');

const PageType = new GraphQLObjectType({
    name: 'PageType',
    fields: () => ({
        _id: {type: GraphQLID},
        type: {type: GraphQLInt},
        pageType: {type: GraphQLInt},
        title: {type: GraphQLString},
        subtitle: {type: GraphQLString},
        bodytext: {type: GraphQLString},
        tstamp: {type: GraphQLDate},
        defaultPage: {type: GraphQLBoolean},
        order: {type: GraphQLInt},
        pageNew: {type: GraphQLBoolean},
        files: {type: GraphQLJSON},
        legal: {type: GraphQLBoolean},
        deleted: {type: GraphQLBoolean}
    })
});

module.exports = PageType;
