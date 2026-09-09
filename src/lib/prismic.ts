import { createClient } from '@prismicio/client'
import { ROUTES } from '@lib/constants'

import type { Lang } from '@lib/i18n'
import type { BlogPostDocument, LayoutDocument } from '@typez/generated/prismic'

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

export function getBlogPosts(lang: Lang): Promise<BlogPostDocument[]> {
    return client.getAllByType('blog_post', {
        lang,
        orderings: [
            { field: 'document.first_publication_date', direction: 'desc' },
        ],
    })
}
