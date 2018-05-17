import gql from 'graphql-tag';

export default gql`
    mutation AddModule($name: String!, $bodytext: String!, $price: Float!, $groupId: ID, $categoryId: ID, $defaultModule: Boolean, $internalHours: Float, $externalHours: Float, $pricePerHour: Int, $signed: Boolean) {
        addModule(name: $name, bodytext: $bodytext, price: $price, groupId: $groupId, categoryId: $categoryId, defaultModule: $defaultModule, internalHours: $internalHours, externalHours: $externalHours, pricePerHour: $pricePerHour, signed: $signed ){
            _id
            name
        }
    }
`;
