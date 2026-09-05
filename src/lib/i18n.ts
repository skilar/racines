// The keys here are what Prismic uses. We get everything else from that.
export const LOCALES = {
    'fr-fr': { path: '', bcp47: 'fr', og: 'fr_FR', label: 'Fr' },
    'en-us': { path: 'en', bcp47: 'en', og: 'en_US', label: 'En' },
} as const

export type Lang = keyof typeof LOCALES

// Interface copy that has no home in Prismic.
export const UI = {
    'fr-fr': {
        aboutTheAuthor: 'À propos de l’autrice',
        backToRef: (number: number) => `Retour à l’appel de note ${number}`,
        emailAddress: 'E-mail',
        firstName: 'Prénom',
        language: 'Langue',
        lastName: 'Nom',
        menu: 'Menu',
        notes: 'Notes',
        readMore: 'Lire la suite',
        signUp: 'S’abonner',
        skipToContent: 'Skip to content',
        untitledEntry: 'Article sans titre',
    },
    'en-us': {
        aboutTheAuthor: 'About the Author',
        backToRef: (number: number) => `Back to note ${number}`,
        emailAddress: 'Email Address',
        firstName: 'First Name',
        language: 'Language',
        lastName: 'Last Name',
        menu: 'Menu',
        notes: 'Notes',
        readMore: 'Continue reading',
        signUp: 'Sign Up',
        skipToContent: 'Skip to content',
        untitledEntry: 'Untitled entry',
    },
} as const

export const LANGS = Object.keys(LOCALES) as Lang[]

// Matches `i18n.defaultLocale` in astro.config.ts.
export const DEFAULT_LANG: Lang = 'fr-fr'

// Path segments that identify a locale, e.g. `en`. The default locale has none.
const PREFIXES = new Map(
    LANGS.filter((lang) => LOCALES[lang].path).map((lang) => [
        LOCALES[lang].path as string,
        lang,
    ]),
)

const toSegments = (pathname: string) => pathname.split('/').filter(Boolean)

// Rebuilds a path with a leading and trailing slash, per `trailingSlash: 'always'`.
const toPath = (segments: string[]) =>
    segments.length > 0 ? `/${segments.join('/')}/` : '/'

export function getLangFromPath(pathname: string): Lang {
    const [first] = toSegments(pathname)

    // '' is never a key because locales without a path prefix are filtered out above.
    return PREFIXES.get(first ?? '') ?? DEFAULT_LANG
}

// The same path in another locale, e.g. `/journal/` to `/en/journal/`.
export function swapLocalePath(pathname: string, lang: Lang): string {
    const segments = toSegments(pathname)

    if (segments[0] && PREFIXES.has(segments[0])) {
        segments.shift()
    }

    const { path } = LOCALES[lang]

    return toPath(path ? [path, ...segments] : segments)
}

// Open Graph locales for `og:locale` and its alternates.
export function getOgLocales(lang: Lang) {
    return {
        current: LOCALES[lang].og,
        alternates: LANGS.filter((l) => l !== lang).map((l) => LOCALES[l].og),
    }
}
