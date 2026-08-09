export const LANGS = ['en-us', 'fr-fr'] as const
export type Lang = (typeof LANGS)[number]
