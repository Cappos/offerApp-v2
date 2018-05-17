import gql from 'graphql-tag';

export default gql`
    mutation DeleteModule($id: ID!) {
        deleteModule(id: $id){
            name
        }
    }
`;
