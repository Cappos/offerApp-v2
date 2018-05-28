import gql from 'graphql-tag';

export default gql`
    query fetchCategory( $id: ID!){
        category (id: $id){
            _id
            name
            value
            tstamp
        }
    }
`;
