import gql from 'graphql-tag';

export default gql`
    {
        sealers{
            _id
            position
            title
            name
            email
            phone
            mobile
            value
        }
    }
`;
