import { asImageSrc, asImageWidthSrcSet, isFilled } from '@prismicio/client'

import type { ImageFieldImage } from '@prismicio/client'

async function getLqip(url: string): Promise<string> {
    try {
        const res = await fetch(url)
        if (res.ok) {
            const type = res.headers.get('content-type') ?? 'image/jpeg'
            const buf = Buffer.from(await res.arrayBuffer())
            return `data:${type};base64,${buf.toString('base64')}`
        }
    } catch {
        // fall back to the remote URL
    }

    return url
}

interface GetImageDetailsProps {
    image: ImageFieldImage
    quality?: number | undefined
}

export interface ImageDetails {
    alt: string
    height: number
    lqip: string
    src: string
    srcset: string
    url: string
    width: number
}

export default async function getImageDetails({
    image,
    quality = 65,
}: GetImageDetailsProps): Promise<ImageDetails | null> {
    if (!isFilled.image(image)) {
        return null
    }

    const { height, width } = image.dimensions
    const lqipUrl = asImageSrc(image, { fm: 'jpg', q: 20, w: 20 })
    const { src, srcset } = asImageWidthSrcSet(image, { q: quality })

    return {
        alt: image.alt ?? '',
        height,
        lqip: await getLqip(lqipUrl),
        src,
        srcset,
        url: image.url,
        width,
    }
}
