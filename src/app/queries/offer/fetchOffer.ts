import gql from 'graphql-tag';

export default gql`
    query fetchOffer( $id: ID!){
        offer(_id: $id) {
            _id
            offerNumber
            offerTitle
            bodytext
            totalPrice
            signedPrice
            tstamp
            expDate
            files
            signed
            internalHours
            externalHours
            comments
            version
            timeline
            sealer {
                _id
                name
                position
                title
                phone
                mobile
                email
                value
            }
            client {
                _id
                companyName
            }
            contacts
            groups {
                _id
                name
                subTotal
                total
                tstamp
                type
                order
                summary
                modules {
                    _id
                    name
                    bodytext
                    price
                    tstamp
                    internalHours
                    externalHours
                    pricePerHour
                    signed
                    categoryId {
                        value
                        _id
                        name
                    }
                }
            }
            pages {
                _id
                type
                pageType
                title
                subtitle
                bodytext
                tstamp
                order
                files
                legal
            }

        }
        clients {
            _id
            companyName
            contacts {
                _id
                contactPerson
            }
        }
        sealers {
            _id
            name
            value
        }
    }
`;
