import { asHTML, isFilled } from '@prismicio/client'
import getFixer from '@lib/get-fixer'
import { UI } from '@lib/i18n'
import { collectNotes } from '@lib/notes'
import tightenNoteRefs from '@lib/tighten-note-refs'

import type {
    HTMLRichTextMapSerializer,
    ImageFieldImage,
    RichTextField,
} from '@prismicio/client'
import type { Lang } from '@lib/i18n'
import type { JournalDocument } from '@lib/prismic'

const IMAGE_MAX_WIDTH = 1200
const IMAGE_QUALITY = 75

const READER_COLUMN = 700
const ROW_GAP = 16
const ROW_STYLE = 'display:flex;gap:1em;flex-wrap:wrap'
const ROW_IMAGE_STYLE = 'flex:1 1 200px;min-width:0;margin:0'

const RELATIVE_URL = /\b(href|src)="(\/(?!\/)[^"]*)"/g

// Use MultiMarkdown's naming for footnote anchors. NetNewsWire detects this.
const noteId = (uid: string, number: number) => `fn-${uid}-${number}`
const noteRefId = (uid: string, number: number) => `fnref-${uid}-${number}`

const escapeAttr = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')

function absolutizeUrls(html: string, site: string): string {
    if (!site) {
        return html
    }

    return html.replace(
        RELATIVE_URL,
        (_match, attribute: string, path: string) =>
            `${attribute}="${new URL(path, site).toString()}"`,
    )
}

function imageSrc(image: ImageFieldImage<'filled'>, width: number): string {
    const url = new URL(image.url)

    for (const param of ['h', 'height', 'w']) {
        url.searchParams.delete(param)
    }

    url.searchParams.set('q', String(IMAGE_QUALITY))
    url.searchParams.set('width', String(width))

    return url.toString()
}

function renderImage(
    image: ImageFieldImage<'filled'>,
    layoutWidth: number,
    style?: string,
): string {
    const { height: naturalHeight, width: naturalWidth } = image.dimensions
    const width = Math.min(naturalWidth, layoutWidth)
    const height = Math.round(naturalHeight * (width / naturalWidth))
    const src = imageSrc(
        image,
        Math.min(naturalWidth, width * 2, IMAGE_MAX_WIDTH),
    )

    return `<img src="${escapeAttr(src)}" alt="${escapeAttr(image.alt ?? '')}" width="${width}" height="${height}"${style ? ` style="${style}"` : ''} />`
}

const rowImageWidth = (count: number) =>
    Math.floor((READER_COLUMN - ROW_GAP * (count - 1)) / count)

export default function renderEntryHtml(
    entry: JournalDocument,
    lang: Lang,
    site: string,
): string {
    const fixer = getFixer(lang)
    const { uid } = entry

    let noteNumber = 0

    const renderRichText = (
        field: RichTextField,
        serializer?: HTMLRichTextMapSerializer,
    ): string =>
        isFilled.richText(field)
            ? tightenNoteRefs(
                  fixer.fixHtml(
                      asHTML(field, {
                          serializer: {
                              // Returning nothing falls through to Prismic's
                              // default, `<span class="{label}">`. Footnotes
                              // cannot take that path: the label's text is the
                              // note itself, so it would land in the prose.
                              label: ({ node }) => {
                                  if (node.data.label !== 'footnote') {
                                      return
                                  }

                                  noteNumber += 1

                                  const ref = noteRefId(uid, noteNumber)
                                  const note = noteId(uid, noteNumber)
                                  const title = escapeAttr(UI[lang].viewNote)

                                  return `<sup id="${ref}"><a class="footnote" href="#${note}" title="${title}">${noteNumber}</a></sup>`
                              },
                              ...serializer,
                          },
                      }),
                  ),
              )
            : ''

    const parts: string[] = []

    // Only an essay opens with a subtitle and a cover image.
    if (entry.type === 'blog_post') {
        parts.push(
            renderRichText(entry.data.subtitle, {
                paragraph: ({ children }) =>
                    `<h2 style="font-weight:400">${children}</h2>`,
            }),
        )

        if (isFilled.image(entry.data.cover_image)) {
            const description = renderRichText(
                entry.data.cover_image_description,
            )

            parts.push(
                `<figure>${renderImage(entry.data.cover_image, IMAGE_MAX_WIDTH)}${description && `<figcaption>${description}</figcaption>`}</figure>`,
            )
        } else {
            parts.push(renderRichText(entry.data.cover_image_description))
        }
    }

    for (const slice of entry.data.slices) {
        switch (slice.slice_type) {
            case 'image_list': {
                const images = slice.primary.images
                    .map(({ image }) => image)
                    .filter(isFilled.image)

                // Not every variation has a caption.
                const caption =
                    'caption' in slice.primary
                        ? renderRichText(slice.primary.caption)
                        : ''

                if (images.length === 0 && !caption) {
                    break
                }

                // A lone image has no row to sit in, whatever the variation.
                const isRow =
                    slice.variation !== 'vertical' && images.length > 1

                const rendered = isRow
                    ? `<div style="${ROW_STYLE}">${images
                          .map((image) =>
                              renderImage(
                                  image,
                                  rowImageWidth(images.length),
                                  ROW_IMAGE_STYLE,
                              ),
                          )
                          .join('')}</div>`
                    : images
                          .map((image) => renderImage(image, IMAGE_MAX_WIDTH))
                          .join('')

                parts.push(
                    `<figure>${rendered}${caption && `<figcaption>${caption}</figcaption>`}</figure>`,
                )
                break
            }
            case 'text': {
                const text = renderRichText(slice.primary.text)

                if (!text) {
                    break
                }

                // On the site a pull quote is only styling. A feed reader sees
                // none of that, so give it the markup that carries the meaning.
                parts.push(
                    slice.variation === 'pullQuote'
                        ? `<blockquote>${text}</blockquote>`
                        : text,
                )
                break
            }
        }
    }

    const notes = collectNotes(entry.data.slices, lang)

    if (notes.length > 0) {
        const items = notes
            .map((note) => {
                const back = escapeAttr(UI[lang].backToRef(note.number))

                // `footnoteBackLink` is the class NetNewsWire hides inside a
                // popover, so the arrow shows in the list below but not in the
                // note that pops up over the marker.
                return `<li id="${noteId(uid, note.number)}"><p>${note.html} <a href="#${noteRefId(uid, note.number)}" class="footnoteBackLink" title="${back}">↩︎</a></p></li>`
            })
            .join('')

        parts.push(
            `<div class="footnotes"><hr /><h3>${UI[lang].notes}</h3><ol>${items}</ol></div>`,
        )
    }

    return absolutizeUrls(parts.filter(Boolean).join('\n'), site)
}
