import gql from 'graphql-tag';

export default gql`
    mutation UpdateUser($id: ID!, $username: String!, $email: String!, $password: String!) {
        editUser(id: $id, username: $username, email: $email, password: $password){
            username
        }
    }
`;
