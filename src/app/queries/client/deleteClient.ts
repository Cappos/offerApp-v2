import gql from 'graphql-tag';

export default gql`
    mutation DeleteClient($id: ID!) {
        deleteClient(id: $id){
            companyName
        }
    }
`;
