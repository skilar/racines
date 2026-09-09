import type { AlternateLanguage } from '@prismicio/client'

export interface LayoutProps {
    alternateLanguages?: AlternateLanguage[] | undefined
    description?: string | null | undefined
    modifiedTime?: string | null | undefined
    ogImage?: string | null | undefined
    ogImageAlt?: string | null | undefined
    ogType?: 'article' | 'website' | undefined
    publishedTime?: string | null | undefined
    title?: string | null | undefined
}
