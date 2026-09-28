import { defineConfig, fontProviders } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import netlify from '@astrojs/netlify'
import { DEFAULT_LANG, LANGS, LOCALES } from './src/lib/i18n'

const locales = LANGS.map((lang) => LOCALES[lang].bcp47)
const defaultLocale = LOCALES[DEFAULT_LANG].bcp47

const ERROR_PAGE = /\/(404|500)\/$/

export default defineConfig({
    adapter: netlify(),
    base: '/',
    fonts: [
        {
            cssVariable: '--font-garamond',
            fallbacks: ['serif'],
            name: 'EB Garamond',
            options: {
                variants: [
                    {
                        display: 'swap',
                        src: ['./src/assets/fonts/EBGaramond[wdth,wght].woff2'],
                        style: 'normal',
                        weight: '400 800',
                    },
                    {
                        display: 'swap',
                        src: [
                            './src/assets/fonts/EBGaramond-Italic[wdth,wght].woff2',
                        ],
                        style: 'italic',
                        weight: '400 800',
                    },
                ],
            },
            provider: fontProviders.local(),
        },
    ],
    i18n: {
        locales,
        defaultLocale,
    },
    integrations: [
        sitemap({
            filter: (page) => !ERROR_PAGE.test(new URL(page).pathname),
            i18n: {
                defaultLocale,
                locales: Object.fromEntries(
                    LANGS.map((lang) => [
                        LOCALES[lang].bcp47,
                        LOCALES[lang].og.replace('_', '-'),
                    ]),
                ),
            },
        }),
    ],
    site: 'https://www.racinesversailles.com',
    trailingSlash: 'always',
})
