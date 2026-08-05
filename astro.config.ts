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
                            './src/assets/fonts/Le Grand Trial Italic VAR-VF.woff2',
                        ],
                        style: 'italic',
                        weight: '100 900',
                    },
                    {
                        display: 'swap',
                        src: ['./src/assets/fonts/Le Grand Trial VAR-VF.woff2'],
                        style: 'normal',
                        weight: '100 900',
                    },
                ],
            },
            provider: fontProviders.local(),
        },
        {
            cssVariable: '--font-romain-du-roi',
            name: 'Romain du Roi',
            options: {
                variants: [
                    {
                        display: 'swap',
                        src: [
                            './src/assets/fonts/Romain du Roi Trial Italic VAR-VF.woff2',
                        ],
                        stretch: '50% 100%',
                        style: 'italic',
                        variationSettings: "'CNTR' 0 100",
                        weight: '100 900',
                    },
                    {
                        display: 'swap',
                        src: [
                            './src/assets/fonts/Romain du Roi Trial VAR-VF.woff2',
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
    ],
})
