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

type GetStaticPrismicPaths = (
    params: GetStaticPrismicPathsParams,
) => Promise<GetStaticPrismicPathsReturn[]>

const getStaticPrismicPaths: GetStaticPrismicPaths = async ({ lang, type }) => {
    const documents = await client.getAllByType(type, { lang })

    return documents
        .filter(({ uid }) => !RESERVED_UIDS.has(uid))
        .map(({ uid }) => ({ params: { uid } }))
}

export default getStaticPrismicPaths
