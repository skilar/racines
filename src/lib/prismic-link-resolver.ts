import { asLink, isFilled } from '@prismicio/client'
import { JOURNAL_PAGE_UID, JOURNAL_TYPES, ROUTES } from '@lib/constants'
import { fixText } from '@lib/get-fixer'

import type { LinkField } from '@prismicio/client'
import type { Lang } from '@lib/i18n'

interface RouteTarget {
    lang?: string
    type: string
    uid?: string | null
}

export type AriaCurrent = 'page' | 'true' | undefined

export interface NavLink {
    ariaCurrent: AriaCurrent
    attrs: LinkAttrs
    label: string
}

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
const PAGE_TYPE = 'page'

const JOURNAL_ROUTE_TYPES: readonly string[] = JOURNAL_TYPES

// `/en/notebook/:uid/` matches `/en/notebook/anything/` and nothing deeper.
const toPattern = (path: string) =>
    new RegExp(
        `^${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(':uid', '[^/]+')}$`,
    )

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

/**
 * A journal entry lives at a path of its own, but in the nav it belongs to the
 * journal, so its section is the journal index rather than its own path.
 */
export function getSectionPath(currentPath: string, lang: Lang): string {
    const current = withTrailingSlash(currentPath)

    const isEntry = ROUTES.some(
        (route) =>
            route.lang === lang &&
            JOURNAL_ROUTE_TYPES.includes(route.type) &&
            toPattern(route.path).test(current),
    )

    return isEntry
        ? resolveRoute({ lang, type: PAGE_TYPE, uid: JOURNAL_PAGE_UID })
        : current
}

// `page` needs the exact path; `true` only needs the section the path is in.
export function getAriaCurrent(
    href: string,
    currentPath: string,
    sectionPath = currentPath,
): AriaCurrent {
    if (isExternal(href) || href.startsWith('#')) {
        return undefined
    }

    const link = withTrailingSlash(href)
    const current = withTrailingSlash(currentPath)
    const section = withTrailingSlash(sectionPath)

    if (link === current) {
        return 'page'
    }

    return !ROOT_PATHS.has(link) && section.startsWith(link)
        ? 'true'
        : undefined
}

export function getNavLinks(
    links: readonly LinkField[],
    { currentPath, lang }: { currentPath: string; lang: Lang },
): NavLink[] {
    const sectionPath = getSectionPath(currentPath, lang)

    return links.flatMap((link) => {
        const attrs = getLinkAttrs(link)

        return attrs && isFilled.keyText(link.text)
            ? [
                  {
                      ariaCurrent: getAriaCurrent(
                          attrs.href,
                          currentPath,
                          sectionPath,
                      ),
                      attrs,
                      label: fixText(link.text, lang),
                  },
              ]
            : []
    })
}
