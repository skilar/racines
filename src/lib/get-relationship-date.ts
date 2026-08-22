import type { FilledContentRelationshipField } from '@prismicio/client'

// The Prismic API returns publication dates on content relationships, but
// @prismicio/client's FilledContentRelationshipField type omits them.
interface WithPublicationDates {
    first_publication_date: string
}

export default function getRelationshipDate(
    link: FilledContentRelationshipField,
) {
    return (link as FilledContentRelationshipField & WithPublicationDates)
        .first_publication_date
}
