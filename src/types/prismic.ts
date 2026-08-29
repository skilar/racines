import type { SliceZone } from '@prismicio/client'

import type { AllDocumentTypes } from './generated/prismic'

// Prismic names a slice zone after its field's API ID (`slices`, `slices1`, …),
// so gather every slice-zone field on every document rather than one name.
type AnySliceZone<Doc> = Doc extends { data: infer Data }
    ? Extract<Data[keyof Data], SliceZone>
    : never

export type AnySlice = AnySliceZone<AllDocumentTypes>[number]
