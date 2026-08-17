import { LANG_LABELS, LANGS } from '@lib/constants'
import { resolveRoute } from '@lib/prismic-link-resolver'

import type { AlternateLanguage } from '@prismicio/client'
import type { Lang } from '@lib/constants'

const HOME_TYPE = 'temp_homepage'

interface GetLangLinksArgs {
    alternateLanguages?: AlternateLanguage[] | undefined
    currentPath: string
    lang: Lang
}

interface LangLink {
    href: string
    label: string
    lang: Lang
    selected: boolean
}

export const getLangLinks = ({
    alternateLanguages = [],
    currentPath,
    lang,
}: GetLangLinksArgs): LangLink[] =>
    LANGS.map((l) => {
        const alternate = alternateLanguages.find((alt) => alt.lang === l)

        const href =
            l === lang
                ? currentPath
                : ((alternate && resolveRoute(alternate)) ??
                  resolveRoute({ lang: l, type: HOME_TYPE }) ??
                  '/')

        return {
            href,
            label: LANG_LABELS[l],
            lang: l,
            selected: l === lang,
        }
    })
