import gql from 'graphql-tag';
import 'graphql-type-json';

export default gql`
    mutation UpdatePage($id: ID!, $title: String!, $subtitle: String, $bodytext: String,  $files: JSON, $pageType: Int, $legal: Boolean) {
        editPage(id: $id, title: $title, subtitle: $subtitle, bodytext: $bodytext,  files: $files, pageType: $pageType, legal: $legal){
            title
        }
    }
`;
