import createRssFeed from '@lib/create-rss-feed'

import type { APIContext } from 'astro'

export const GET = (context: APIContext) => createRssFeed('fr-fr', context)
