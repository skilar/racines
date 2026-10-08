import { asHTML, isFilled } from '@prismicio/client'
import splitRomanOrdinal from '@lib/split-roman-ordinal'

import type {
    HTMLRichTextMapSerializer,
    RichTextField,
} from '@prismicio/client'

const unwrap = ({ children }: { children: string }) => children

// An inline run of text, like a citation or a heading, so every block gives up
// its wrapper. Images and embeds have no place in it at all.
const INLINE: HTMLRichTextMapSerializer = {
    heading1: unwrap,
    heading2: unwrap,
    heading3: unwrap,
    heading4: unwrap,
    heading5: unwrap,
    heading6: unwrap,
    paragraph: unwrap,
    preformatted: unwrap,
    list: unwrap,
    oList: unwrap,
    listItem: unwrap,
    oListItem: unwrap,
    image: () => '',
    embed: () => '',
    // Returning nothing falls through to Prismic's default,
    // `<span class="{label}">`.
    label: ({ node, text }) =>
        node.data.label === 'small-caps' || node.data.label === 'ordinal-nums'
            ? splitRomanOrdinal(text)
            : undefined,
}

/**
 * A rich text field as one run of inline HTML, its blocks joined by a space.
 * It has not been through the fixer, so callers run it once they are done.
 */
export default function inlineRichText(field: RichTextField): string {
    return isFilled.richText(field)
        ? field
              .map((block) => asHTML([block], { serializer: INLINE }).trim())
              .filter(Boolean)
              .join(' ')
        : ''
}
