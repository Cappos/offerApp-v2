import gql from 'graphql-tag';

export default gql`
    {
        offers {
            _id
            offerNumber
            totalPrice
            tstamp
            client {
                _id
                companyName
            }
        }
    }
`;
