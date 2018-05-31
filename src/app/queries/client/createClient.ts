import gql from 'graphql-tag';
import 'graphql-type-json';

export default gql`
    mutation AddClient($companyName: String!, $address: String, $webSite: String, $contacts: JSON) {
        addClient(companyName: $companyName, address: $address, webSite: $webSite, contacts: $contacts){
            companyName
        }
    }
`;
