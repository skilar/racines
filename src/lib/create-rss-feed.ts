import rss from '@astrojs/rss'
import { SITE_NAME } from '@lib/constants'
import { fetchJournalItemsForRss } from '@lib/fetch-journal-items-for-rss'
import { UI } from '@lib/i18n'

import type { APIContext } from 'astro'
import type { Lang } from '@lib/i18n'

export default async function createRssFeed(lang: Lang, context: APIContext) {
    const site = context.site?.toString() ?? ''

    return rss({
        customData: `<language>${lang}</language>`,
        description: UI[lang].siteDescription,
        items: await fetchJournalItemsForRss(lang, site),
        site,
        title: SITE_NAME,
    })
}
