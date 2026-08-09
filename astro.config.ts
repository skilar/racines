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
            cssVariable: '--font-le-grand',
            fallbacks: ['serif'],
            name: 'Le Grand',
            options: {
                variants: [
                    {
                        display: 'swap',
                        src: [
                            './src/assets/fonts/Le Grand Trial Italic VAR-VF-full.woff2',
                        ],
                        style: 'italic',
                        weight: '100 900',
                    },
                    {
                        display: 'swap',
                        src: [
                            './src/assets/fonts/Le Grand Trial VAR-VF-full.woff2',
                        ],
                        style: 'normal',
                        weight: '100 900',
                    },
                ],
            },
            provider: fontProviders.local(),
        },
        {
            cssVariable: '--font-romain-du-roi',
            fallbacks: ['serif'],
            name: 'Romain du Roi',
            options: {
                variants: [
                    {
                        display: 'swap',
                        src: [
                            './src/assets/fonts/Romain du Roi Trial Italic VAR-VF-full.woff2',
                        ],
                        stretch: '50% 100%',
                        style: 'italic',
                        variationSettings: "'CNTR' 0 100",
                        weight: '100 900',
                    },
                    {
                        display: 'swap',
                        src: [
                            './src/assets/fonts/Romain du Roi Trial VAR-VF-full.woff2',
                        ],
                        stretch: '50% 100%',
                        style: 'normal',
                        variationSettings: "'CNTR' 0 100",
                        weight: '100 900',
                    },
                ],
            },
            provider: fontProviders.local(),
        },
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
