import gql from 'graphql-tag';

export default gql`
    {
        groups{
            _id
            name
            subTotal
            total
            tstamp
        }
    }
`;
