import gql from 'graphql-tag';

export default gql`
    mutation AddUser($username: String!, $email: String!, $password: String!) {
        addUser(username: $username, email: $email, password: $password){
            _id,
            username
        }
    }
`;
