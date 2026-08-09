import { createClient } from '@prismicio/client'
import { ROUTES } from '@lib/constants'

export const client = createClient(import.meta.env.PRISMIC_REPOSITORY || '', {
    routes: ROUTES,
})
