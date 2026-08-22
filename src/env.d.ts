interface ImportMetaEnv {
    readonly GITHUB_TOKEN: string
    readonly PRISMIC_REPOSITORY: string
    readonly PRISMIC_CUSTOM_TYPES_API_TOKEN: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare namespace App {
    interface Locals {
        lang: import('@lib/i18n').Lang
    }
}
