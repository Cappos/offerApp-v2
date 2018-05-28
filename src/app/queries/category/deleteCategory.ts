import gql from 'graphql-tag';

export default gql`
    mutation DeleteCategory($id: ID!) {
        deleteCategory(id: $id){
            name
        }
    }
`;
