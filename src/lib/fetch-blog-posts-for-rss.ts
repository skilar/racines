import { asText, isFilled } from '@prismicio/client'
import { fixText } from '@lib/get-fixer'
import { UI } from '@lib/i18n'
import { getBlogPosts } from '@lib/prismic'
import { resolveRoute } from '@lib/prismic-link-resolver'
import renderBlogPostHtml from '@lib/render-blog-post-html'

import type { RSSFeedItem } from '@astrojs/rss'
import type { Lang } from '@lib/i18n'

type FetchBlogPostsForRss = (lang: Lang, site: string) => Promise<RSSFeedItem[]>

export const fetchBlogPostsForRss: FetchBlogPostsForRss = async (
    lang,
    site,
) => {
    const posts = await getBlogPosts(lang)

    return posts.map((post) => ({
        content: renderBlogPostHtml(post, lang, site),
        link:
            post.url ??
            resolveRoute({ lang, type: 'blog_post', uid: post.uid }),
        pubDate: new Date(post.first_publication_date),
        title: isFilled.keyText(post.data.title)
            ? fixText(post.data.title, lang)
            : UI[lang].untitledEntry,
        ...(isFilled.richText(post.data.short_description) && {
            description: fixText(asText(post.data.short_description), lang),
        }),
    }))
}
