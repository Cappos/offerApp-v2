import gql from 'graphql-tag';

export default gql`
    query fetchClientContact( $id: ID!){
        client (id: $id){
            _id,
            companyName ,
            contacts {
                _id
                contactPerson
            }
        }
    }
`;
