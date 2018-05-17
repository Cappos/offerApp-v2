import gql from 'graphql-tag';

export default gql`
    mutation UpdatePrice($id: ID!, $value: Int!) {
        editPrice(id: $id, value: $value){
            value
        }
    }
`;
