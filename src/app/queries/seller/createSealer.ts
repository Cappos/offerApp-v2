import gql from 'graphql-tag';

export default gql`
    mutation AddSealer($position: String, $title: String, $name: String!, $email: String!, $phone: String, $mobile: String, $value: Int!) {
        addSealer(position: $position, title: $title, name: $name, email: $email, phone: $phone, mobile: $mobile, value: $value){
            _id,
            position
            title
            name
            email
            phone
            mobile
            value
        }
    }
`;
