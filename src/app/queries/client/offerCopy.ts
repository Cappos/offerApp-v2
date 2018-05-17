import gql from 'graphql-tag';

export default gql`
    mutation offerCopy($id: ID!, $client: ID!) {
        copyOffer(id: $id, client: $client){
            _id
        }
    }
`;
