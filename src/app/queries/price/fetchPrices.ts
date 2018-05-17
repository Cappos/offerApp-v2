import gql from 'graphql-tag';

export default gql`
    {
        prices {
            _id
            value
        }
    }
`;
