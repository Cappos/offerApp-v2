import gql from 'graphql-tag';

export default gql`
    {
        pages {
            _id
            type
            pageType
            title
            subtitle
            bodytext
            tstamp
            files
            legal
        }
    }

`;
