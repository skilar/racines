import { createClient } from '@prismicio/custom-types-client'
import type { CustomTypesClient } from '@prismicio/custom-types-client'

const readEnv = (name: string): string => {
    const value = process.env[name]

    if (!value) {
        throw new Error(
            `Missing ${name}.\n` +
                `Add it to .env. A write-enabled token can be created with:\n` +
                `  npx prismic login\n` +
                `  npx prismic token create --write`,
        )
    }

    return value
}

/**
 * Creates a Custom Types API client from the environment. Node provides a
 * global fetch, so no fetch implementation needs to be supplied.
 */
export const createModelsClient = (): CustomTypesClient =>
    createClient({
        repositoryName: readEnv('PRISMIC_REPOSITORY'),
        token: readEnv('PRISMIC_CUSTOM_TYPES_API_TOKEN'),
    })
