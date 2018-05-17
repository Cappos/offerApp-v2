import gql from 'graphql-tag';

export default gql`
    {
        clients{
            _id
            companyName ,
            address,
            webSite 
            tstamp
            offers {
                _id
                offerNumber
            }
        }
    }
`;
