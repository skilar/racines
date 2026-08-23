import { asHTML } from '@prismicio/client'
import getFixer from '@lib/get-fixer'

import type {
    RTInlineNode,
    RTLabelNode,
    RTNode,
    RTTextNode,
    RichTextField,
    SliceZone,
} from '@prismicio/client'
import type { Lang } from '@lib/i18n'
import type { AnySlice } from '@typez/prismic'

const FOOTNOTE = 'footnote'

export interface Sidenote {
    number: number // 1-based, in document order across the whole slice zone.
    id: string // Anchor on the endnote at the foot of the article.
    refId: string // Anchor on the marker in the running text.
    html: string // The note itself, as inline HTML.
}

// Anchors for the markers and the endnotes.
export const noteId = (number: number) => `note-${number}`
export const noteRefId = (number: number) => `ref-${number}`

/**
 * We pull sidenotes only from these fields within these slices. Only
 * articles (blog posts) have sidenotes/footnotes. So other slices are ignored.
 */
export function getSidenoteFields(slice: AnySlice): RichTextField[] {
    switch (slice.slice_type) {
        case 'image_list':
            // Not all variations have a caption
            return 'caption' in slice.primary ? [slice.primary.caption] : []
        case 'text':
            return [slice.primary.text]
        default:
            return []
    }
}

// Image and embed nodes carry no text to annotate.
const hasSpans = (node: RTNode): node is RTTextNode => 'spans' in node

const isFootnote = (span: RTInlineNode): span is RTLabelNode =>
    span.type === 'label' && span.data.label === FOOTNOTE

/**
 * Every footnote in a field, in reading order. `asHTML` sorts spans by where
 * they start rather than trusting the order the API returns them in. Matching
 * that is what keeps these numbers lined up with the rendered markers.
 */
function getFootnotes(field: RichTextField) {
    // `RichTextField` is a tuple union, which loses the type guard on `filter`.
    const nodes: RTNode[] = [...field]

    return nodes.filter(hasSpans).flatMap((node) =>
        node.spans
            .filter(isFootnote)
            .sort((a, b) => a.start - b.start)
            .map((span) => ({ node, span })),
    )
}

export function countSidenotes(slice: AnySlice): number {
    return getSidenoteFields(slice).reduce(
        (total, field) => total + getFootnotes(field).length,
        0,
    )
}

/**
 * A footnote is a span inside a larger block. Lift it out into a block of its
 * own so it can be rendered alone, with its emphasis and links intact.
 */
function toInlineHtml(node: RTTextNode, footnote: RTLabelNode): string {
    const text = node.text.slice(footnote.start, footnote.end)
    const spans = node.spans
        .filter(
            (span) =>
                span !== footnote &&
                span.start >= footnote.start &&
                span.end <= footnote.end,
        )
        .map((span) => ({
            ...span,
            start: span.start - footnote.start,
            end: span.end - footnote.start,
        }))

    return asHTML([{ type: 'paragraph', text, spans }], {
        serializer: {
            label: ({ node, children }) =>
                `<span class="${node.data.label}">${children}</span>`,
            // The note goes inside an `li`, so it wants no block of its own.
            paragraph: ({ children }) => children,
        },
    })
}

export function collectSidenotes(
    slices: SliceZone<AnySlice>,
    lang: Lang,
): Sidenote[] {
    const fixer = getFixer(lang)

    return slices
        .flatMap(getSidenoteFields)
        .flatMap(getFootnotes)
        .map(({ node, span }, index) => {
            const number = index + 1

            return {
                number,
                id: noteId(number),
                refId: noteRefId(number),
                html: fixer.fixHtml(toInlineHtml(node, span)),
            }
        })
}
