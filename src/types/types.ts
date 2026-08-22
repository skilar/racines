import type { AlternateLanguage } from '@prismicio/client'

export interface LayoutProps {
    alternateLanguages?: AlternateLanguage[]
    description?: string | null
    ogImage?: string | null
    ogImageAlt?: string | null
    title?: string | null
}
