import gql from 'graphql-tag';

export default gql`
    query fetchPage( $id: ID!){
        page (id: $id){
            _id
            type
            pageType
            title
            subtitle
            bodytext
            files
            legal
            tstamp
        }
    }
`;
