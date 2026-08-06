import { createClient } from '@prismicio/client'

export const client = createClient(import.meta.env.PRISMIC_REPOSITORY || '')
