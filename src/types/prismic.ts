import type { AllDocumentTypes } from './generated/prismic'

export type AnySlice = Extract<
    AllDocumentTypes,
    { data: { slices: unknown } }
>['data']['slices'][number]
