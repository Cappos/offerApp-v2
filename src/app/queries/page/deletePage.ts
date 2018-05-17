import gql from 'graphql-tag';

export default gql`
    mutation DeletePage($id: ID!) {
        deletePage(id: $id){
            title
        }
    }
`;
