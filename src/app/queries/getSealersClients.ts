import gql from 'graphql-tag';

export default gql`
    {
        clients{
            _id
            companyName
        }

        sealers{
            _id
            name
            value
        }
    }
`;