import gql from 'graphql-tag';

export default gql`
    mutation UpdateSealer($id: ID!, $position: String, $title: String, $name: String!, $email: String!, $phone: String, $mobile: String) {
        editSealer(id: $id, position: $position, title: $title, name: $name, email: $email, phone: $phone, mobile: $mobile, ){
            name
        }
    }
`;
