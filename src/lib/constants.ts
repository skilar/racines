import type { Route } from '@prismicio/client'

export const LANGS = ['en-us', 'fr-fr'] as const
export type Lang = (typeof LANGS)[number]

export const ROUTES: Route[] = [
    { type: 'homepage', path: '/home' },
    { type: 'homepage', lang: 'fr-fr', path: '/fr/home' },
    { type: 'temp_homepage', path: '/' },
    { type: 'temp_homepage', lang: 'fr-fr', path: '/fr' },
]
