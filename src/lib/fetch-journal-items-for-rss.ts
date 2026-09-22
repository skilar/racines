import { asText, isFilled } from '@prismicio/client'
import getEntryTitle from '@lib/get-entry-title'
import { fixText } from '@lib/get-fixer'
import { getJournalDocuments } from '@lib/prismic'
import { resolveRoute } from '@lib/prismic-link-resolver'
import renderEntryHtml from '@lib/render-entry-html'

import type { RSSFeedItem } from '@astrojs/rss'
import type { Lang } from '@lib/i18n'

type FetchJournalItemsForRss = (
    lang: Lang,
    site: string,
) => Promise<RSSFeedItem[]>

export const fetchJournalItemsForRss: FetchJournalItemsForRss = async (
    lang,
    site,
) => {
    const entries = await getJournalDocuments(lang)

    return entries.map((entry) => ({
        content: renderEntryHtml(entry, lang, site),
        link:
            entry.url ??
            resolveRoute({ lang, type: entry.type, uid: entry.uid }),
        pubDate: new Date(entry.first_publication_date),
        title: getEntryTitle(entry.data, lang),
        // Only an essay has a short description.
        ...(entry.type === 'blog_post' &&
            isFilled.richText(entry.data.short_description) && {
                description: fixText(
                    asText(entry.data.short_description),
                    lang,
                ),
            }),
    }))
}
