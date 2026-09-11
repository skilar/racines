import { isFilled } from '@prismicio/client'

import type {
    ImageFieldImage,
    RichTextField,
    SliceZone,
} from '@prismicio/client'
import type { AnySlice } from '@typez/prismic'

export interface LightboxItem {
    image: ImageFieldImage
    caption: RichTextField
}

export function getZoomableImages(slice: AnySlice): LightboxItem[] {
    switch (slice.slice_type) {
        case 'image_list':
            // Filter on the same condition as `ImageList.astro` so that the
            // indices line up with each image's `data-zoom-index`.
            return slice.primary.images
                .filter(({ image }) => isFilled.image(image))
                .map(({ image, image_caption }) => ({
                    image,
                    caption: image_caption,
                }))
        default:
            return []
    }
}

export function countZoomableImages(slice: AnySlice): number {
    return getZoomableImages(slice).length
}

export function collectZoomableImages(
    slices: SliceZone<AnySlice>,
): LightboxItem[] {
    return slices.flatMap(getZoomableImages)
}
