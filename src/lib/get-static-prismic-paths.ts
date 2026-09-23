import { RESERVED_UIDS } from '@lib/constants'
import { client } from '@lib/prismic'

import type { Lang } from '@lib/i18n'
import type { AllDocumentTypes } from '@typez/generated/prismic'

// Every document type that has a UID, and therefore a `[uid]` route.
type UidType = Extract<AllDocumentTypes, { uid: string }>['type']

interface GetStaticPrismicPathsParams {
    lang: Lang
    type: UidType
}

interface GetStaticPrismicPathsReturn {
    params: {
        uid: string
    }
}

export default async function getStaticPrismicPaths({
    lang,
    type,
}: GetStaticPrismicPathsParams): Promise<GetStaticPrismicPathsReturn[]> {
    const documents = await client.getAllByType(type, { lang })

    // The generic widens `uid` to nullable, though these types all have one.
    return documents.flatMap(({ uid }) =>
        uid && !RESERVED_UIDS.has(uid) ? [{ params: { uid } }] : [],
    )
}
