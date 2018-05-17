const graphqlToJson = require('graphql-to-json');
graphqlToJson({input: './server/schema/schema.js', output: './server/schema.json'});