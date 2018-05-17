import gql from 'graphql-tag';
import 'graphql-type-json';

export default gql`
    mutation UpdateClient($id: ID!, $companyName: String!, $address: String, $contacts: JSON, $webSite: String) {
        editClient(id: $id, companyName: $companyName, contacts: $contacts, address: $address, webSite: $webSite){
            companyName
        }
    }
`;
