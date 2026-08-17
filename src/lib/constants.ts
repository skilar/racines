import type { Route } from '@prismicio/client'

export const LANGS = ['fr-fr', 'en-us'] as const
export type Lang = (typeof LANGS)[number]

export const LANG_LABELS: Record<Lang, string> = {
    'fr-fr': 'Fr',
    'en-us': 'En',
}

export const ROUTES: Route[] = [
    { type: 'blog_post', lang: 'en-us', path: '/en/journal/:uid/' },
    { type: 'blog_post', lang: 'fr-fr', path: '/journal/:uid/' },
    { type: 'homepage', lang: 'en-us', path: '/en/home/' },
    { type: 'homepage', lang: 'fr-fr', path: '/home/' },
    { type: 'temp_homepage', lang: 'en-us', path: '/en/' },
    { type: 'temp_homepage', lang: 'fr-fr', path: '/' },
]
