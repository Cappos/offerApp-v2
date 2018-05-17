import gql from 'graphql-tag';

export default gql`
    mutation AddPrice($value: Int!) {
        addPrice(value: $value){
            value
        }
    }
`;
