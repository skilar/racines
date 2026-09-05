import type { RTNode, RichTextField, SliceZone } from '@prismicio/client'
import type { TextSlice } from '@typez/generated/prismic'
import type { AnySlice } from '@typez/prismic'

const PREVIEW_PARAGRAPHS = 3

const isBodyText = (slice: AnySlice): slice is TextSlice =>
    slice.slice_type === 'text' && slice.variation === 'default'

export default function getPostPreview(
    slices: SliceZone<AnySlice>,
): RichTextField {
    const zone: AnySlice[] = [...slices]
    const body = zone.find(isBodyText)

    if (!body) {
        return []
    }

    const preview: RTNode[] = []

    for (const node of body.primary.text) {
        if (
            node.type !== 'paragraph' ||
            preview.length === PREVIEW_PARAGRAPHS
        ) {
            break
        }

        preview.push(node)
    }

    return preview as RichTextField
}
