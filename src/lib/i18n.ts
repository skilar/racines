// The keys here are what Prismic uses. We get everything else from that.
export const LOCALES = {
    'fr-fr': { path: '', bcp47: 'fr', og: 'fr_FR', label: 'Fr' },
    'en-us': { path: 'en', bcp47: 'en', og: 'en_US', label: 'En' },
} as const

export type Lang = keyof typeof LOCALES

export const UI = {
    'fr-fr': {
        aboutTheAuthor: 'À propos de l’autrice',
        backToRef: (number: number) => `Retour à l’appel de note ${number}`,
        closeImageViewer: 'Fermer la visionneuse',
        emailAddress: 'E-mail',
        firstName: 'Prénom',
        imageViewer: 'Visionneuse d’images',
        language: 'Langue',
        lastName: 'Nom',
        menu: 'Menu',
        nextImage: 'Image suivante',
        notes: 'Notes',
        previousImage: 'Image précédente',
        readMore: 'Lire la suite',
        signUp: 'S’abonner',
        siteDescription: 'Recettes historiques',
        skipToContent: 'Aller au contenu',
        untitledEntry: 'Article sans titre',
        viewFullScreen: 'Afficher en plein écran',
        viewNote: 'Voir la note',
    },
    'en-us': {
        aboutTheAuthor: 'About the Author',
        backToRef: (number: number) => `Back to note ${number}`,
        closeImageViewer: 'Close image viewer',
        emailAddress: 'Email Address',
        firstName: 'First Name',
        imageViewer: 'Image viewer',
        language: 'Language',
        lastName: 'Last Name',
        menu: 'Menu',
        nextImage: 'Next image',
        notes: 'Notes',
        previousImage: 'Previous image',
        readMore: 'Continue reading',
        signUp: 'Sign Up',
        siteDescription: 'Historical recipes',
        skipToContent: 'Skip to content',
        untitledEntry: 'Untitled entry',
        viewFullScreen: 'View full screen',
        viewNote: 'See footnote',
    },
} as const

export const LANGS = Object.keys(LOCALES) as Lang[]

export const isLang = (value: string): value is Lang =>
    Object.hasOwn(LOCALES, value)

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
export const toPath = (segments: string[]) =>
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

export const feedParam = (lang: Lang) => lang.replace('-', '_')
export const feedPath = (lang: Lang) => `/feed-${feedParam(lang)}.xml`
export const langFromFeedParam = (param: string): Lang | undefined =>
    LANGS.find((lang) => feedParam(lang) === param)
