import { asImageSrc, isFilled } from '@prismicio/client'

import type { ImageField } from '@prismicio/client'

const OG_IMAGE_WIDTH = 1200

export interface OgImage {
    alt: string | null
    url: string
}

// Searches the array for the first filled image. Pass the
// meta image first, and other images second.
export default function getOgImage(
    ...candidates: ImageField[]
): OgImage | null {
    const image = candidates.find(isFilled.image)

    if (!image) {
        return null
    }

    return {
        alt: image.alt,
        url: asImageSrc(image, { w: OG_IMAGE_WIDTH }),
    }
}
