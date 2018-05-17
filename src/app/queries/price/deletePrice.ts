import gql from 'graphql-tag';

export default gql`
    mutation DeletePrice($id: ID!) {
        deletePrice(id: $id){
          value
        }
    }
`;
