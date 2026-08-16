import { client } from '@lib/prismic'

import type { Lang } from '@lib/constants'

interface GetStaticPrismicPathsParams {
    lang?: Lang
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

const getStaticPrismicPaths: GetStaticPrismicPaths = async ({
    lang = 'en-us',
    type,
}) => {
    const posts = await client.getAllByType(type, { lang })
    const paths = posts.map((post) => {
        return { params: { uid: post.uid } }
    })

    return paths
}

export default getStaticPrismicPaths
