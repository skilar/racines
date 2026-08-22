import { LANGS } from '@lib/constants'
import type { Lang } from '@lib/constants'

export const getOgLang = (lang: Lang) => {
    switch (lang) {
        case 'fr-fr':
            return 'fr_FR'
        case 'en-us':
            return 'en_US'
        default:
            return 'en_US'
    }
}

export const getOgLangs = (lang: Lang) => {
    const currentLang = getOgLang(lang)
    const otherLangs = LANGS.filter((l: Lang) => l !== lang).map(getOgLang)

    return { currentLang, otherLangs }
}
