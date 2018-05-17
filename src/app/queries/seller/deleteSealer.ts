import gql from 'graphql-tag';

export default gql`
    mutation DeleteSealer($id: ID!) {
        deleteSealer(id: $id){
            name
        }
    }
`;
