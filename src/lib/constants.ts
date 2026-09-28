import { LANGS, LOCALES, toPath } from '@lib/i18n'

import type { Route } from '@prismicio/client'
import type { Lang } from '@lib/i18n'

const ROUTE_PATTERNS = {
    blog_post: 'journal/:uid',
    homepage: '',
    notebook_post: { 'fr-fr': 'carnet/:uid', 'en-us': 'notebook/:uid' },
    page: ':uid',
    recipe: { 'fr-fr': 'recettes/:uid', 'en-us': 'recipes/:uid' },
} as const satisfies Record<string, string | Record<Lang, string>>

export type RoutedType = keyof typeof ROUTE_PATTERNS

const patternFor = (type: RoutedType, lang: Lang): string => {
    const pattern = ROUTE_PATTERNS[type]

    return typeof pattern === 'string' ? pattern : pattern[lang]
}

export const ROUTES: Route[] = LANGS.flatMap((lang) =>
    (Object.keys(ROUTE_PATTERNS) as RoutedType[]).map((type) => ({
        type,
        lang,
        path: toPath(
            [LOCALES[lang].path, patternFor(type, lang)].filter(Boolean),
        ),
    })),
)

// Every type the journal gathers into one stream. Each has a route of its own,
// but in the nav they all count as the journal.
export const JOURNAL_TYPES = ['blog_post', 'notebook_post', 'recipe'] as const

// The journal index is a `page` document with a dedicated route file.
export const JOURNAL_PAGE_UID = 'journal'

/**
 * The recipe index is a `page` document. Its UID differs per locale so that the
 * `page` pattern, `:uid`, resolves to the path the index actually lives at.
 */
export const RECIPES_PAGE_UID: Record<Lang, string> = {
    'fr-fr': 'recettes',
    'en-us': 'recipes',
}

// Pages with dedicated files are restricted because we don't want
// `[uid].astro` to generate them a second time, if the UID is also
// used in Prismic.
export const RESERVED_UIDS = new Set([
    '404',
    '500',
    JOURNAL_PAGE_UID,
    ...Object.values(RECIPES_PAGE_UID),
])

export const SITE_NAME = 'Racines Versailles'
