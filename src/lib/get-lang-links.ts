import { LANGS, LOCALES, swapLocalePath } from '@lib/i18n'
import { resolveRoute } from '@lib/prismic-link-resolver'

import type { AlternateLanguage } from '@prismicio/client'
import type { Lang } from '@lib/i18n'

const HOME_TYPE = 'homepage'

interface GetLangLinksArgs {
    alternateLanguages?: AlternateLanguage[] | undefined
    currentPath: string
    lang: Lang
}

interface LangLink {
    href: string
    label: string
    selected: boolean
}

const getHref = (
    lang: Lang,
    currentPath: string,
    alternateLanguages: AlternateLanguage[] | undefined,
) => {
    if (!alternateLanguages) {
        return swapLocalePath(currentPath, lang)
    }

    const alternate = alternateLanguages.find((alt) => alt.lang === lang)

    return alternate
        ? resolveRoute(alternate)
        : resolveRoute({ lang, type: HOME_TYPE })
}

export const getLangLinks = ({
    alternateLanguages,
    currentPath,
    lang,
}: GetLangLinksArgs): LangLink[] =>
    LANGS.map((l) => ({
        href:
            l === lang
                ? currentPath
                : getHref(l, currentPath, alternateLanguages),
        label: LOCALES[l].label,
        selected: l === lang,
    }))
