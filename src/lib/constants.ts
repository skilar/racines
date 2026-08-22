import type { Route } from '@prismicio/client'

export const ROUTES: Route[] = [
    { type: 'blog_post', lang: 'en-us', path: '/en/journal/:uid/' },
    { type: 'blog_post', lang: 'fr-fr', path: '/journal/:uid/' },
    { type: 'homepage', lang: 'en-us', path: '/en/' },
    { type: 'homepage', lang: 'fr-fr', path: '/' },
    { type: 'page', lang: 'en-us', path: '/en/:uid/' },
    { type: 'page', lang: 'fr-fr', path: '/:uid/' },
]
