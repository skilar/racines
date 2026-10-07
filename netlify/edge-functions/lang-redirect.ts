import {
    LANG_COOKIE,
    findAlternateHref,
    getPreferredLang,
    getSwitchedLang,
    isInternalNavigation,
} from '../../src/lib/lang-preference.ts'
import { getLangFromPath } from '../../src/lib/i18n.ts'

import type { Config, Context } from '@netlify/edge-functions'

const ONE_YEAR = 60 * 60 * 24 * 365

export default async (request: Request, context: Context) => {
    const url = new URL(request.url)
    const referer = request.headers.get('referer')

    if (
        isInternalNavigation({
            host: url.host,
            referer,
            secFetchSite: request.headers.get('sec-fetch-site'),
        })
    ) {
        const switched = getSwitchedLang({ pathname: url.pathname, referer })

        if (switched) {
            context.cookies.set({
                maxAge: ONE_YEAR,
                name: LANG_COOKIE,
                path: '/',
                sameSite: 'Lax',
                secure: true,
                value: switched,
            })
        }

        return context.next()
    }

    const preferred = getPreferredLang({
        acceptLanguage: request.headers.get('accept-language'),
        cookie: context.cookies.get(LANG_COOKIE),
    })

    if (!preferred || preferred === getLangFromPath(url.pathname)) {
        return context.next()
    }

    const response = await context.next()

    if (
        response.status !== 200 ||
        !response.headers.get('content-type')?.includes('text/html')
    ) {
        return response
    }

    const html = await response.text()
    const location = findAlternateHref(html, preferred)

    if (!location) {
        return new Response(html, response)
    }

    return new Response(null, {
        headers: {
            'Cache-Control': 'private, no-store',
            Location: location,
            Vary: 'Accept-Language, Cookie',
        },
        status: 302,
    })
}

export const config: Config = {
    excludedPath: ['/_astro/*', '/.netlify/*', '/rva/*'],
    // Files with an extension: feeds, sitemaps, icons, images.
    excludedPattern: '\\.[a-z0-9]+$',
    method: 'GET',
    onError: 'bypass',
    path: '/*',
}
