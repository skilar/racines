import { isFilled } from '@prismicio/client'

import type { ImageListSlice } from '@typez/generated/prismic'

export type BoldImageListSlice = Extract<
    ImageListSlice,
    { variation: 'twoBoldImages' | 'threeBoldImages' }
>

export const isBoldImageList = (
    slice: ImageListSlice,
): slice is BoldImageListSlice =>
    slice.variation === 'twoBoldImages' || slice.variation === 'threeBoldImages'

export function getBoldImages(slice: BoldImageListSlice) {
    const { primary } = slice

    return [
        { image: primary.image_one, caption: primary.image_one_caption },
        { image: primary.image_two, caption: primary.image_two_caption },
        ...(slice.variation === 'threeBoldImages'
            ? [
                  {
                      image: slice.primary.image_three,
                      caption: slice.primary.image_three_caption,
                  },
              ]
            : []),
    ].flatMap(({ image, caption }) =>
        isFilled.image(image) ? [{ image, caption }] : [],
    )
}
