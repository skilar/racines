import { asText, isFilled } from '@prismicio/client'
import escapeAttr from '@lib/escape-attr'
import getFixer, { fixText } from '@lib/get-fixer'
import getPostPreview from '@lib/get-post-preview'
import { UI } from '@lib/i18n'
import inlineRichText from '@lib/inline-rich-text'

import type { RichTextField, SliceZone } from '@prismicio/client'
import type { Lang } from '@lib/i18n'
import type { AnySlice } from '@typez/prismic'

const MAX_DERIVED_LENGTH = 70

interface Entry {
    // A notebook post may go untitled, so its opening words stand in.
    slices?: SliceZone<AnySlice>
    title: RichTextField
}

// Cuts at the last whole word that fits, rather than mid-word.
function truncate(text: string): string {
    if (text.length <= MAX_DERIVED_LENGTH) {
        return text
    }

    const cut = text.slice(0, MAX_DERIVED_LENGTH)
    const lastSpace = cut.lastIndexOf(' ')

    return `${cut.slice(0, lastSpace > 0 ? lastSpace : undefined).trimEnd()}…`
}

function getOpeningText(slices: SliceZone<AnySlice>): string {
    const opening = getPostPreview(slices)?.text[0]

    return opening ? truncate(asText([opening]).trim()) : ''
}

/**
 * The plain-text title of a journal entry, for headings, `<title>`, and feeds:
 * its own title, else its opening words, else a generic label.
 */
export default function getEntryTitle(
    { slices, title }: Entry,
    lang: Lang,
): string {
    if (isFilled.richText(title)) {
        return fixText(asText(title), lang)
    }

    const opening = slices ? getOpeningText(slices) : ''

    return opening ? fixText(opening, lang) : UI[lang].untitledEntry
}

/**
 * The title as HTML, for the visible headings, so labels like small caps
 * survive. The fallbacks are plain text, so they are only escaped.
 */
export function getEntryTitleHtml(entry: Entry, lang: Lang): string {
    return isFilled.richText(entry.title)
        ? getFixer(lang).fixHtml(inlineRichText(entry.title))
        : escapeAttr(getEntryTitle(entry, lang))
}
