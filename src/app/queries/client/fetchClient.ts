import gql from 'graphql-tag';

export default gql`
    query fetchClient( $id: ID!){
        client (id: $id){
            _id,
            companyName ,
            address,
            webSite
            contacts {
                _id
                contactPerson
                contactPhone
                mobile
                mail
            },
            tstamp
            offers {
                _id
                offerNumber
                offerTitle
                tstamp
            }
        }
    }
`;
