import { createClient, filter } from '@prismicio/client'
import { JOURNAL_TYPES, ROUTES } from '@lib/constants'

import type { Ordering } from '@prismicio/client'
import type { Lang } from '@lib/i18n'
import type {
    BlogPostDocument,
    LayoutDocument,
    NotebookPostDocument,
    RecipeDocument,
} from '@typez/generated/prismic'

export type JournalDocument =
    BlogPostDocument | NotebookPostDocument | RecipeDocument

const repository = import.meta.env.PRISMIC_REPOSITORY

if (!repository) {
    throw new Error('PRISMIC_REPOSITORY is not set. Add it to .env.')
}

export const client = createClient(repository, { routes: ROUTES })

const layouts = new Map<Lang, Promise<LayoutDocument>>()

export function getLayout(lang: Lang): Promise<LayoutDocument> {
    const cached = layouts.get(lang)

    if (cached) {
        return cached
    }

    const layout = client.getSingle('layout', { lang })
    layouts.set(lang, layout)

    return layout
}

const NEWEST_FIRST: Ordering[] = [
    { field: 'document.first_publication_date', direction: 'desc' },
]

export function getJournalDocuments(lang: Lang): Promise<JournalDocument[]> {
    return client.dangerouslyGetAll<JournalDocument>({
        lang,
        filters: [filter.any('document.type', [...JOURNAL_TYPES])],
        orderings: NEWEST_FIRST,
    })
}
