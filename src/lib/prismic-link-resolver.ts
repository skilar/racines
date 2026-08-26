import { asLink, isFilled } from '@prismicio/client'
import { ROUTES } from '@lib/constants'

import type { LinkField } from '@prismicio/client'

interface RouteTarget {
    lang?: string
    type: string
    uid?: string | null
}

export type AriaCurrent = 'page' | 'true' | undefined

export interface LinkAttrs {
    href: string
    rel?: string | undefined
    target?: string | undefined
}

const withTrailingSlash = (path: string) =>
    path.endsWith('/') ? path : `${path}/`

// Mirrors @prismicio/client's isInternalURL, which is not exported.
const isExternal = (url: string) => !/^(\/(?!\/)|#)/.test(url)

const HOME_TYPE = 'homepage'

const ROOT_PATHS = new Set(
    ROUTES.filter((r) => r.type === HOME_TYPE).map((r) =>
        withTrailingSlash(r.path),
    ),
)

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

export function getLinkAttrs(link: LinkField): LinkAttrs | null {
    if (!isFilled.link(link)) {
        return null
    }

    const href = asLink(link, { linkResolver: resolveRoute })

    if (!href) {
        return null
    }

    const target =
        'target' in link && typeof link.target === 'string'
            ? link.target
            : undefined

    return {
        href,
        ...(target ? { target } : {}),
        ...(isExternal(href) ? { rel: 'noopener noreferrer' } : {}),
    }
}

export function getAriaCurrent(href: string, currentPath: string): AriaCurrent {
    if (isExternal(href) || href.startsWith('#')) {
        return undefined
    }

    const link = withTrailingSlash(href)
    const current = withTrailingSlash(currentPath)

    if (link === current) {
        return 'page'
    }

    return !ROOT_PATHS.has(link) && current.startsWith(link)
        ? 'true'
        : undefined
}
