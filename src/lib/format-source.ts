import { asHTML, asLink, isFilled } from '@prismicio/client'
import getFixer from '@lib/get-fixer'
import escapeAttr from '@lib/escape-attr'

import type {
    HTMLRichTextMapSerializer,
    RichTextField,
} from '@prismicio/client'
import type { Lang } from '@lib/i18n'
import type { SourceListSliceDefaultPrimarySourcesItem } from '@typez/generated/prismic'

type Source = SourceListSliceDefaultPrimarySourcesItem

const unwrap = ({ children }: { children: string }) => children

// A citation is one run of text, so every block gives up its wrapper. Images
// and embeds have no place in it at all.
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
}

const inline = (field: RichTextField): string =>
    isFilled.richText(field)
        ? field
              .map((block) => asHTML([block], { serializer: INLINE }).trim())
              .filter(Boolean)
              .join(' ')
        : ''

const TERMINAL = /[.?!…]$/

const endsSentence = (html: string) =>
    TERMINAL.test(html.replace(/<[^>]*>/g, '').trim())

// Closes an element with a period, unless it already has one, as in an
// author's initial or a title that ends in a question mark.
const sentence = (html: string) => (endsSentence(html) ? html : `${html}.`)

const joinParts = (parts: string[], separator: string) =>
    parts.filter(Boolean).join(separator)

const capitalize = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1)

// Straight quotes here; the fixer curls them for the locale. Quoted titles
// aren't italic, and the style is inline because feed readers drop our CSS.
const quote = (html: string) =>
    `<cite style="font-style:normal">"${html}"</cite>`

interface Fields {
    author: string
    title: string
    container: string
    volume: string
    pages: string
    place: string
    publisher: string
    date: string
    medium: string
    collection: string
}

/**
 * Chicago bibliography style. Each element closes with a period. Volume and
 * page go together as 3:247, and the period sits inside a quoted title.
 */
function chicago(type: Source['type'], f: Fields): string {
    const quotedTitle =
        f.title && quote(endsSentence(f.title) ? f.title : `${f.title}.`)
    const italicTitle = f.title && `<cite>${f.title}</cite>`

    // Place: Publisher, Date.
    const publication = joinParts(
        [joinParts([f.place, f.publisher], ': '), f.date],
        ', ',
    )

    let parts: string[]

    switch (type) {
        case 'section': {
            const where =
                f.volume && f.pages
                    ? `${f.volume}:${f.pages}`
                    : f.volume
                      ? `vol. ${f.volume}`
                      : f.pages

            parts = [
                quotedTitle,
                f.container &&
                    joinParts([`In <cite>${f.container}</cite>`, where], ', '),
                publication,
            ]
            break
        }
        case 'artwork':
            parts = [
                italicTitle,
                f.date,
                capitalize(f.medium),
                joinParts([f.collection, f.place], ', '),
            ]
            break
        case 'web_page':
            parts = [quotedTitle, f.container, f.date]
            break
        default:
            parts = [italicTitle, f.volume && `Vol. ${f.volume}`, publication]
    }

    return [f.author, ...parts]
        .filter(Boolean)
        .map((part) => (part === quotedTitle ? part : sentence(part)))
        .join(' ')
}

/**
 * French bibliographic style, as set out by the Imprimerie nationale. Elements
 * are separated by commas and the entry ends with a single period. Volume and
 * page come last, as t. 3, p. 247.
 */
function french(type: Source['type'], f: Fields): string {
    const quotedTitle = f.title && quote(f.title)
    const italicTitle = f.title && `<cite>${f.title}</cite>`
    const locator = [f.volume && `t. ${f.volume}`, f.pages && `p. ${f.pages}`]

    let parts: string[]

    switch (type) {
        case 'section':
            parts = [
                quotedTitle,
                f.container && `dans <cite>${f.container}</cite>`,
                f.place,
                f.publisher,
                f.date,
                ...locator,
            ]
            break
        case 'artwork':
            parts = [italicTitle, f.date, f.medium, f.collection, f.place]
            break
        case 'web_page':
            parts = [quotedTitle, f.container, f.date]
            break
        default:
            parts = [italicTitle, f.place, f.publisher, f.date, ...locator]
    }

    return sentence(joinParts([f.author, ...parts], ', '))
}

/**
 * One source as a bibliography entry, ready to go inside an `li`. English
 * follows Chicago, French its own tradition. Missing elements drop out along
 * with their punctuation.
 */
export default function formatSource(source: Source, lang: Lang): string {
    const url = isFilled.link(source.link) ? asLink(source.link) : null
    const title = inline(source.title)

    const fields: Fields = {
        author: inline(source.author),
        title:
            url && title
                ? `<a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">${title}</a>`
                : title,
        container: inline(source.container),
        volume: inline(source.volume),
        pages: inline(source.pages),
        place: inline(source.place),
        publisher: inline(source.publisher),
        date: inline(source.date),
        medium: inline(source.medium),
        collection: inline(source.collection),
    }

    const entry =
        lang === 'fr-fr'
            ? french(source.type, fields)
            : chicago(source.type, fields)

    return getFixer(lang).fixHtml(entry)
}
