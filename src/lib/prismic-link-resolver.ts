import { asLink } from '@prismicio/client'
import { ROUTES } from '@lib/constants'

import type { LinkField, PrismicDocument } from '@prismicio/client'

interface RouteTarget {
    lang?: string
    type: string
    uid?: string | null
}

const withTrailingSlash = (path: string) =>
    path.endsWith('/') ? path : `${path}/`

export function resolveRoute({ lang, type, uid }: RouteTarget) {
    const route =
        ROUTES.find(
            (r) => r.type === type && r.lang === lang && r.uid === uid,
        ) ??
        ROUTES.find((r) => r.type === type && r.lang === lang) ??
        ROUTES.find((r) => r.type === type && !r.lang)

    if (!route) {
        return '/'
    }

    if (route.path.includes(':uid') && !uid) {
        return '/'
    }

    const path = route.path.replace(':uid', uid ?? '')

    // In the ROUTES const we ask for a trailing slash, but just in case
    // something happens, we add one here.
    return withTrailingSlash(path)
}

type FieldOrDocument = LinkField | PrismicDocument | null | undefined

export default function linkResolver(page: FieldOrDocument) {
    return asLink(page, { linkResolver: resolveRoute })
}
