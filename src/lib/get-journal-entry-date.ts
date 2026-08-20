import { asDate } from '@prismicio/client'

import type { Lang } from '@lib/constants'

export default function getJournalEntryDate(rawDate: string, lang: Lang) {
    const date = asDate(rawDate)

    return date.toLocaleDateString(lang, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}
