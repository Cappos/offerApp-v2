import gql from 'graphql-tag';

export default gql`
    {
        dashboardOffers {
            _id
            offerNumber
            offerTitle
            tstamp
        }
        dashboardClients {
            _id
            companyName
            tstamp
        }
    }
`;
