import type { AlternateLanguage } from '@prismicio/client'
import type { Lang } from '@lib/constants'

export interface LayoutProps {
    alternateLanguages?: AlternateLanguage[]
    description?: string | null
    lang: Lang
    ogImage?: string | null
    ogImageAlt?: string | null
    title?: string | null
}
