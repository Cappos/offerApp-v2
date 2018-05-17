import gql from 'graphql-tag';

export default gql`
    query fetchPrice( $id: ID!){
        price (id: $id){
            _id
           value
        }
    }
`;
