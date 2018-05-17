import gql from 'graphql-tag';
import 'graphql-type-json';

export default gql`
    mutation UpdateGroup($id: ID!, $name: String!, $subTotal: Float, $total: Float, $modulesNew: JSON) {
        editGroup(id:$id, name: $name, subTotal: $subTotal, total: $total, modulesNew: $modulesNew){
            name
        }
    }
`;

