import { RESERVED_UIDS } from '@lib/constants'
import { client } from '@lib/prismic'

import type { Lang } from '@lib/i18n'
import type { AllDocumentTypes } from '@typez/generated/prismic'

// Every document type that has a UID, and therefore a `[uid]` route.
type UidType = Extract<AllDocumentTypes, { uid: string }>['type']

interface GetStaticPrismicPathsParams<Type extends UidType> {
    lang: Lang
    // Several types may share one `[uid]` route, as the journal's do.
    type: Type | readonly Type[]
}

interface GetStaticPrismicPathsReturn<Type extends UidType> {
    params: {
        uid: string
    }
    props: {
        type: Type
    }
}

export default async function getStaticPrismicPaths<Type extends UidType>({
    lang,
    type,
}: GetStaticPrismicPathsParams<Type>): Promise<
    GetStaticPrismicPathsReturn<Type>[]
> {
    const types: readonly Type[] = typeof type === 'string' ? [type] : type

    const results = await Promise.all(
        types.map(async (documentType) => {
            const documents = await client.getAllByType(documentType, { lang })

            // The generic widens `uid` to nullable, though these types all have one.
            return documents.flatMap(({ uid }) =>
                uid ? [{ type: documentType, uid }] : [],
            )
        }),
    )

    const entries = results.flat()

    // Prismic keeps UIDs unique per type only, so types sharing a route can clash.
    const seen = new Map<string, Type>()

    for (const { type: documentType, uid } of entries) {
        const other = seen.get(uid)

        if (other) {
            throw new Error(
                `The UID "${uid}" (${lang}) is used by both a ${other} and a ${documentType}, which share a route. Rename one of them in Prismic.`,
            )
        }

        seen.set(uid, documentType)
    }

    return entries
        .filter(({ uid }) => !RESERVED_UIDS.has(uid))
        .map(({ type: documentType, uid }) => ({
            params: { uid },
            props: { type: documentType },
        }))
}
