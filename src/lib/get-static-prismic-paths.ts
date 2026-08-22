import { client } from '@lib/prismic'

import type { Lang } from '@lib/i18n'

interface GetStaticPrismicPathsParams {
    lang: Lang
    type: 'blog_post' // TODO: set this up properly to allow all post types
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
    const posts = await client.getAllByType(type, { lang })
    const paths = posts.map((post) => {
        return { params: { uid: post.uid } }
    })

    return paths
}

export default getStaticPrismicPaths
