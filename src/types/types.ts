import type { Lang } from '@lib/constants'

export interface LayoutProps {
    description?: string | null
    lang: Lang
    ogImage?: string | null
    ogImageAlt?: string | null
    title?: string | null
}
