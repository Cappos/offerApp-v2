const mongoose = require('mongoose');
const graphql = require('graphql');
const {GraphQLObjectType, GraphQLString, GraphQLID, GraphQLBoolean} = graphql;

const UserType = new GraphQLObjectType({
    name: 'UserType',
    fields: () => ({
        _id: {type: GraphQLID},
        username: {type: GraphQLString},
        password: {type: GraphQLString},
        email: {type: GraphQLString},
        deleted: {type: GraphQLBoolean},
        superAdmin: {type: GraphQLBoolean}
    })
});

module.exports = UserType;
