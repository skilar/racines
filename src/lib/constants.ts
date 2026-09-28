import { LANGS, LOCALES, toPath } from '@lib/i18n'

import type { Route } from '@prismicio/client'
import type { Lang } from '@lib/i18n'

const ROUTE_PATTERNS = {
    blog_post: { 'fr-fr': 'essais/:uid', 'en-us': 'essays/:uid' },
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

export type JournalType = (typeof JOURNAL_TYPES)[number]

/**
 * Each journal type also has an index of its own, a `page` document. Its UID
 * differs per locale so that the `page` pattern, `:uid`, resolves to the path
 * the index actually lives at, alongside the entries of that type.
 */
export const SECTION_PAGE_UIDS = {
    blog_post: { 'fr-fr': 'essais', 'en-us': 'essays' },
    notebook_post: { 'fr-fr': 'carnet', 'en-us': 'notebook' },
    recipe: { 'fr-fr': 'recettes', 'en-us': 'recipes' },
} as const satisfies Record<JournalType, Record<Lang, string>>

// Pages with dedicated files are restricted because we don't want
// `[uid].astro` to generate them a second time, if the UID is also
// used in Prismic.
export const RESERVED_UIDS = new Set([
    '404',
    '500',
    JOURNAL_PAGE_UID,
    ...Object.values(SECTION_PAGE_UIDS).flatMap((uids) => Object.values(uids)),
])

export const SITE_NAME = 'Racines Versailles'
