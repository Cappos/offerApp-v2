import gql from 'graphql-tag';

export default gql`
    query fetchModule( $id: ID!){
        module(id: $id){
            _id
            name
            bodytext
            price
            tstamp
            groupId {
                _id
                name
                value
            }
            categoryId {
                _id
                name
                value
            }
            internalHours
            externalHours
            pricePerHour
            moduleNew
            signed
            deleted
        }
        
        categories {
            _id
            name
            value
        }
        
        prices {
            _id
            value
        }
    } 
`;
