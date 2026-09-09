import { LANGS, LOCALES, toPath } from '@lib/i18n'

import type { Route } from '@prismicio/client'

// Path pattern per document type, without the locale prefix.
const ROUTE_PATTERNS = {
    blog_post: 'journal/:uid',
    homepage: '',
    page: ':uid',
} as const

export type RoutedType = keyof typeof ROUTE_PATTERNS

export const ROUTES: Route[] = LANGS.flatMap((lang) =>
    (Object.keys(ROUTE_PATTERNS) as RoutedType[]).map((type) => ({
        type,
        lang,
        path: toPath(
            [LOCALES[lang].path, ROUTE_PATTERNS[type]].filter(Boolean),
        ),
    })),
)

// Pages with dedicated files are restricted because we don't want
// `[uid].astro` to generate them a second time, if the UID is also
// used in Prismic.
export const RESERVED_UIDS = new Set(['404', '500', 'journal'])

export const SITE_NAME = 'Agathe Giraud'
