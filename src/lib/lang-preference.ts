import { LANGS, LOCALES, getLangFromPath, isLang } from './i18n.ts'

import type { Lang } from './i18n.ts'

// Holds a language the visitor picked, e.g. `fr-fr`.
export const LANG_COOKIE = 'lang'

const langFromTag = (tag: string): Lang | undefined => {
    const primary = tag.trim().toLowerCase().split('-')[0]

    return LANGS.find((lang) => LOCALES[lang].bcp47 === primary)
}

const toUrl = (value: string | null | undefined) => {
    if (!value) {
        return undefined
    }

    try {
        return new URL(value)
    } catch {
        return undefined
    }
}

// The supported language the browser weights highest, e.g. `en-GB,fr;q=0.8`
// is English. Weight ties keep header order.
export function parseAcceptLanguage(
    header: string | null | undefined,
): Lang | undefined {
    const ranked = (header ?? '')
        .split(',')
        .map((part, index) => {
            const [tag = '', ...params] = part.split(';')
            const q = params
                .map((param) => /^q=([\d.]+)$/.exec(param.trim())?.[1])
                .find(Boolean)

            return { index, lang: langFromTag(tag), q: q ? Number(q) : 1 }
        })
        .filter((entry) => entry.lang && entry.q > 0)
        .sort((a, b) => b.q - a.q || a.index - b.index)

    return ranked[0]?.lang
}

export const getPreferredLang = ({
    acceptLanguage,
    cookie,
}: {
    acceptLanguage: string | null | undefined
    cookie: string | null | undefined
}): Lang | undefined =>
    cookie && isLang(cookie) ? cookie : parseAcceptLanguage(acceptLanguage)

// Browsing within the site, including the language switcher. `Sec-Fetch-Site`
// survives referrer policies that strip `Referer`.
export function isInternalNavigation({
    host,
    referer,
    secFetchSite,
}: {
    host: string
    referer: string | null | undefined
    secFetchSite: string | null | undefined
}): boolean {
    if (secFetchSite === 'same-origin') {
        return true
    }

    return toUrl(referer)?.host === host
}

// This page's language when the previous page was in another one, i.e. the
// visitor just used the language switcher.
export function getSwitchedLang({
    pathname,
    referer,
}: {
    pathname: string
    referer: string | null | undefined
}): Lang | undefined {
    const from = toUrl(referer)

    if (!from) {
        return undefined
    }

    const lang = getLangFromPath(pathname)

    return getLangFromPath(from.pathname) === lang ? undefined : lang
}

// The path of this page's translation, from the hreflang links `Head.astro`
// renders, e.g. `/en/essays/marie-antoinettes-brioche/`.
export function findAlternateHref(
    html: string,
    lang: Lang,
): string | undefined {
    const end = html.indexOf('</head>')
    const head = end === -1 ? html : html.slice(0, end)
    const pattern = new RegExp(
        `<link rel="alternate" hreflang="${LOCALES[lang].bcp47}" href="([^"]+)"`,
    )

    return toUrl(pattern.exec(head)?.[1])?.pathname
}
