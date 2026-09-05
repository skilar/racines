import type { RTNode, RichTextField, SliceZone } from '@prismicio/client'
import type { TextSlice } from '@typez/generated/prismic'
import type { AnySlice } from '@typez/prismic'

const PREVIEW_PARAGRAPHS = 3

export interface PostPreview {
    text: RichTextField
    hasMore: boolean
}

const isBodyText = (slice: AnySlice): slice is TextSlice =>
    slice.slice_type === 'text' && slice.variation === 'default'

function getOpeningProse(text: RichTextField): RTNode[] {
    const run: RTNode[] = []

    for (const node of text) {
        if (node.type === 'paragraph') {
            run.push(node)

            if (run.length === PREVIEW_PARAGRAPHS) {
                break
            }
        } else if (run.length > 0) {
            break
        }
    }

    return run
}

export default function getPostPreview(
    slices: SliceZone<AnySlice>,
): PostPreview | null {
    for (const slice of slices) {
        if (!isBodyText(slice)) {
            continue
        }

        const text = getOpeningProse(slice.primary.text)

        // An image or a heading on its own is not an opening
        if (text.length === 0) {
            continue
        }

        return {
            text: text as RichTextField,
            hasMore:
                slices.length > 1 || text.length !== slice.primary.text.length,
        }
    }

    return null
}
