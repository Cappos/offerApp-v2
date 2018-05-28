import gql from 'graphql-tag';

export default gql`
    mutation AddCategory($name: String!) {
        addCategory(name: $name){
            name
        }
    }
`;
