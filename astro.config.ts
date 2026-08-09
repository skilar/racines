import { defineConfig, fontProviders } from 'astro/config'

export default defineConfig({
    site: 'https://www.agathegiraud.com',
    base: '/',
    trailingSlash: 'always',
    i18n: {
        locales: ['es', 'en', 'fr'],
        defaultLocale: 'en',
    },
    fonts: [
        {
            cssVariable: '--font-fern-ornaments',
            fallbacks: ['serif'],
            name: 'Fern Ornaments',
            options: {
                variants: [
                    {
                        display: 'swap',
                        src: [
                            './src/assets/fonts/FernOrnaments-Regular-Testing.woff2',
                        ],
                        style: 'normal',
                        weight: '400',
                    },
                ],
            },
            provider: fontProviders.local(),
        },
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
                    {
                        display: 'swap',
                        src: [
                            './src/assets/fonts/BodoniModa-Italic[opsz,wght].woff2',
                        ],
                        style: 'italic',
                        variationSettings: "'opsz' 6 96",
                        weight: '400 900',
                    },
                ],
            },
            provider: fontProviders.local(),
        },
    ],
})
