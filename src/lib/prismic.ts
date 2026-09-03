import { createClient } from '@prismicio/client'
import { ROUTES } from '@lib/constants'

import type { Lang } from '@lib/i18n'
import type { LayoutDocument } from '@typez/generated/prismic'

export const client = createClient(import.meta.env.PRISMIC_REPOSITORY || '', {
    routes: ROUTES,
})

const layouts = new Map<Lang, Promise<LayoutDocument>>()

export function getLayout(lang: Lang): Promise<LayoutDocument> {
    const cached = layouts.get(lang)

    if (cached) {
        return cached
    }

    const layout = client.getSingle('layout', { lang })
    layouts.set(lang, layout)

    return layout
}
