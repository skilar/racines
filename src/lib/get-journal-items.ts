import getEntryTitle from '@lib/get-entry-title'
import getJournalEntryDate from '@lib/get-journal-entry-date'
import { getJournalDocuments } from '@lib/prismic'
import { resolveRoute } from '@lib/prismic-link-resolver'

import type { Lang } from '@lib/i18n'
import type { JournalDocument } from '@lib/prismic'

interface JournalItemBase {
    dateString: string
    href: string
    publicationDate: string
    title: string
}

// Distributes over the union, so `type` narrows `doc` along with it.
type JournalItemOf<Doc> = Doc extends JournalDocument
    ? JournalItemBase & { doc: Doc; type: Doc['type'] }
    : never

export type JournalItem = JournalItemOf<JournalDocument>
export type JournalItemType = JournalItem['type']

function toJournalItem(doc: JournalDocument, lang: Lang): JournalItem {
    // TypeScript cannot see that `doc.type` and `doc` stay paired.
    return {
        dateString: getJournalEntryDate(doc.first_publication_date, lang),
        doc,
        href: doc.url ?? resolveRoute({ lang, type: doc.type, uid: doc.uid }),
        publicationDate: doc.first_publication_date,
        title: getEntryTitle(doc.data, lang),
        type: doc.type,
    } as JournalItem
}

export async function getJournalItems(lang: Lang): Promise<JournalItem[]> {
    const documents = await getJournalDocuments(lang)

    return documents.map((doc) => toJournalItem(doc, lang))
}
