/**
 * `::first-letter` always takes punctuation that precedes the letter along with
 * it, so a big cap on a paragraph opening with a quote mark would enlarge the
 * quote instead of the letter. Wrapping the quote in a visually hidden span
 * takes it out of flow, and the big cap lands on the letter, while the quote
 * stays in the text for screen readers and copying.
 *
 * Only the first paragraph is touched, since that is the one
 * `p:first-of-type` styles. Opening inline tags (an italic first word, a link)
 * may sit between the paragraph and the quote.
 *
 * Whitespace after the quote goes in the span too, or JoliTypo's French
 * non-breaking space after `«` would leave a gap before the big cap. As in
 * `tighten-note-refs`, U+00A0 arrives as `&nbsp;` because parse5 escapes it.
 */
const FIRST_PARAGRAPH = /<p(?:\s[^>]*)?>/

const LEADING_QUOTE =
    /^((?:<[a-z][^>]*>)*)(["“”«»](?:&nbsp;|[\s\u00A0\u202F\u2009])*)/i

// Runs on the serialized HTML.
export default function hideLeadingQuote(html: string): string {
    const paragraph = FIRST_PARAGRAPH.exec(html)

    if (!paragraph) {
        return html
    }

    const start = paragraph.index + paragraph[0].length
    const rest = html.slice(start)

    const replaced = rest.replace(
        LEADING_QUOTE,
        '$1<span class="visuallyHidden">$2</span>',
    )

    return html.slice(0, start) + replaced
}
