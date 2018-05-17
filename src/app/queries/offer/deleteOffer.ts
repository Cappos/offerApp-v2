import gql from 'graphql-tag';

export default gql`
    mutation DeleteOffer($id: ID!) {
        deleteOffer(id: $id){
            offerNumber
        }
    }
`;
