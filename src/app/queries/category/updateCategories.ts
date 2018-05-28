import gql from 'graphql-tag';

export default gql`
    mutation UpdatCategory($id: ID!, $name: String!) {
        editCategory(id: $id, name: $name){
            _id
            name
        }
    }
`;
