import { isFilled } from '@prismicio/client'

import type { ImageFieldImage, SliceZone } from '@prismicio/client'
import type { AnySlice } from '@typez/prismic'

export function getZoomableImages(slice: AnySlice): ImageFieldImage[] {
    switch (slice.slice_type) {
        case 'image_list':
            return slice.primary.images
                .map(({ image }) => image)
                .filter(isFilled.image)
        default:
            return []
    }
}

export function countZoomableImages(slice: AnySlice): number {
    return getZoomableImages(slice).length
}

export function collectZoomableImages(
    slices: SliceZone<AnySlice>,
): ImageFieldImage[] {
    return slices.flatMap(getZoomableImages)
}
