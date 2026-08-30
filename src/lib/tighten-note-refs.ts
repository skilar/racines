import { constants } from '@skilar/jolitypo-ts'

/**
 * Authors often type a space before applying the footnote label in Prismic.
 * Left as a plain space it is a break opportunity, so a marker landing at the
 * end of a line wraps away from the word it annotates. Any whitespace run
 * before a marker collapses to a single narrow no-break space.
 *
 * The `&nbsp;` alternation is needed because parse5 escapes U+00A0 when
 * JoliTypo re-serializes, so a French non-breaking space arrives here as an
 * entity rather than a character. U+202F is left raw.
 */
const SPACE_BEFORE_NOTE_REF =
    /(?:&nbsp;|[\s\u00A0\u202F])+(?=<a class="note-ref")/g

// Runs on the serialized HTML.
export default function tightenNoteRefs(html: string): string {
    return html.replace(SPACE_BEFORE_NOTE_REF, constants.NO_BREAK_THIN_SPACE)
}
