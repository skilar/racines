import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import {
    findAlternateHref,
    getPreferredLang,
    getSwitchedLang,
    isInternalNavigation,
    parseAcceptLanguage,
} from './lang-preference.ts'

const HOST = 'www.racinesversailles.com'
const ORIGIN = `https://${HOST}`

describe('parseAcceptLanguage', () => {
    it('picks the highest-weighted supported language', () => {
        assert.equal(parseAcceptLanguage('fr;q=0.5,en'), 'en-us')
        assert.equal(parseAcceptLanguage('fr-FR,fr;q=0.9,en;q=0.8'), 'fr-fr')
    })

    it('matches regional tags by primary subtag', () => {
        assert.equal(parseAcceptLanguage('en-GB'), 'en-us')
        assert.equal(parseAcceptLanguage('FR-ca'), 'fr-fr')
    })

    it('skips unsupported languages to find a supported one', () => {
        assert.equal(parseAcceptLanguage('de-DE,de;q=0.9,en;q=0.5'), 'en-us')
    })

    it('keeps header order when weights tie', () => {
        assert.equal(parseAcceptLanguage('en,fr'), 'en-us')
        assert.equal(parseAcceptLanguage('fr,en'), 'fr-fr')
    })

    it('has no preference for unsupported, refused, or missing headers', () => {
        assert.equal(parseAcceptLanguage('de'), undefined)
        assert.equal(parseAcceptLanguage('*'), undefined)
        assert.equal(parseAcceptLanguage('en;q=0'), undefined)
        assert.equal(parseAcceptLanguage(''), undefined)
        assert.equal(parseAcceptLanguage(null), undefined)
    })
})

describe('getPreferredLang', () => {
    it('lets a manual choice outrank the browser', () => {
        assert.equal(
            getPreferredLang({ cookie: 'fr-fr', acceptLanguage: 'en' }),
            'fr-fr',
        )
    })

    it('falls back to the browser when there is no valid choice', () => {
        assert.equal(
            getPreferredLang({ cookie: undefined, acceptLanguage: 'en' }),
            'en-us',
        )
        assert.equal(
            getPreferredLang({ cookie: 'klingon', acceptLanguage: 'en' }),
            'en-us',
        )
    })
})

describe('isInternalNavigation', () => {
    it('trusts Sec-Fetch-Site', () => {
        assert.equal(
            isInternalNavigation({
                host: HOST,
                referer: null,
                secFetchSite: 'same-origin',
            }),
            true,
        )
        assert.equal(
            isInternalNavigation({
                host: HOST,
                referer: null,
                secFetchSite: 'none',
            }),
            false,
        )
    })

    it('falls back to the Referer host', () => {
        assert.equal(
            isInternalNavigation({
                host: HOST,
                referer: `${ORIGIN}/en/`,
                secFetchSite: null,
            }),
            true,
        )
        assert.equal(
            isInternalNavigation({
                host: HOST,
                referer: 'https://www.google.com/',
                secFetchSite: null,
            }),
            false,
        )
        assert.equal(
            isInternalNavigation({
                host: HOST,
                referer: 'not a url',
                secFetchSite: null,
            }),
            false,
        )
    })
})

describe('getSwitchedLang', () => {
    it('detects a switch in either direction', () => {
        assert.equal(
            getSwitchedLang({
                pathname: '/essais/la-brioche-de-marie-antoinette/',
                referer: `${ORIGIN}/en/essays/marie-antoinettes-brioche/`,
            }),
            'fr-fr',
        )
        assert.equal(
            getSwitchedLang({ pathname: '/en/', referer: `${ORIGIN}/` }),
            'en-us',
        )
    })

    it('ignores navigation within one language', () => {
        assert.equal(
            getSwitchedLang({ pathname: '/recettes/', referer: `${ORIGIN}/` }),
            undefined,
        )
        assert.equal(
            getSwitchedLang({ pathname: '/recettes/', referer: null }),
            undefined,
        )
    })
})

describe('findAlternateHref', () => {
    const html = readFileSync(
        new URL('./fixtures/essay-head.html', import.meta.url),
        'utf8',
    )

    it('reads the translation from built hreflang links', () => {
        assert.equal(
            findAlternateHref(html, 'en-us'),
            '/en/essays/marie-antoinettes-brioche/',
        )
    })

    it('encodes non-ASCII paths for a Location header', () => {
        assert.equal(
            findAlternateHref(
                '<head><link rel="alternate" hreflang="en" href="https://www.racinesversailles.com/en/notebook/œuf/"></head>',
                'en-us',
            ),
            '/en/notebook/%C5%93uf/',
        )
    })

    it('finds nothing when the page has no translation', () => {
        assert.equal(
            findAlternateHref(
                '<head><link rel="alternate" hreflang="fr" href="https://www.racinesversailles.com/404/"></head>',
                'en-us',
            ),
            undefined,
        )
    })

    it('ignores hreflang links outside the head', () => {
        assert.equal(
            findAlternateHref(
                '<head></head><body><a rel="alternate" hreflang="en" href="/en/"></a></body>',
                'en-us',
            ),
            undefined,
        )
    })
})
