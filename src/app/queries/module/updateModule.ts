import gql from 'graphql-tag';

export default gql`
    mutation UpdateModule($id: ID!, $name: String!, $bodytext: String!, $price: Float, $groupId: ID, $categoryId: ID, $internalHours: Float, $externalHours: Float, $pricePerHour: Int, $signed: Boolean) {
        editModule(id: $id, name: $name, bodytext: $bodytext, price: $price, groupId: $groupId, categoryId: $categoryId, internalHours: $internalHours, externalHours: $externalHours, pricePerHour: $pricePerHour, signed: $signed){
            name
        }
    }
`;

