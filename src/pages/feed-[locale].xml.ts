import createRssFeed from '@lib/create-rss-feed'
import { LANGS, feedParam, langFromFeedParam } from '@lib/i18n'

import type { APIContext } from 'astro'

export function getStaticPaths() {
    return LANGS.map((lang) => ({ params: { locale: feedParam(lang) } }))
}

export const GET = (context: APIContext) => {
    const lang = langFromFeedParam(context.params.locale ?? '')

    if (!lang) {
        return new Response(null, { status: 404 })
    }

    return createRssFeed(lang, context)
}
