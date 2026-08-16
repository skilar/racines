import { defineConfig, fontProviders } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import netlify from '@astrojs/netlify'

export default defineConfig({
    adapter: netlify(),
    base: '/',
    fonts: [
        {
            cssVariable: '--font-bodoni',
            fallbacks: ['serif'],
            name: 'Bodoni',
            options: {
                variants: [
                    {
                        display: 'swap',
                        src: ['./src/assets/fonts/BodoniModa[opsz,wght].woff2'],
                        style: 'normal',
                        variationSettings: "'opsz' 6 96",
                        weight: '400 900',
                    },
                ],
            },
            provider: fontProviders.local(),
        },
        // {
        //     cssVariable: '--font-crimson-text',
        //     fallbacks: ['serif'],
        //     name: 'Crimson Text',
        //     provider: fontProviders.fontsource(),
        //     styles: ['normal'],
        //     weights: ['400 800'],
        // },
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
        locales: ['en', 'fr'],
        defaultLocale: 'fr',
    },
    integrations: [sitemap()],
    site: 'https://www.agathegiraud.com',
    trailingSlash: 'always',
})
