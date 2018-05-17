import gql from 'graphql-tag';
import 'graphql-type-json';

export default gql`
    query fetchContacts( $id: JSON!){
        contacts(id: $id) {
            contactPerson
            address
            contactPhone
            mobile
            mail
        }
    }
`;
