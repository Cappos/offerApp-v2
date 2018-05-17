import gql from 'graphql-tag';
import 'graphql-type-json';

export default gql`
    mutation AddClient($companyName: String!, $address: String, $webSite: String, $contacts: JSON, $offers: ID) {
        addClient(companyName: $companyName, address: $address, webSite: $webSite, contacts: $contacts, offers: $offers){
            companyName
        }
    }
`;
