import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import eslintPluginAstro from 'eslint-plugin-astro'
import eslintConfigPrettier from 'eslint-config-prettier'

export default defineConfig({
    files: ['**/*.{js,ts}'],
    extends: [
        js.configs.recommended,
        ...tseslint.configs.strictTypeChecked,
        ...tseslint.configs.stylisticTypeChecked,
        ...eslintPluginAstro.configs.recommended,
        eslintConfigPrettier,
        {
            languageOptions: {
                parserOptions: {
                    // projectService: true,
                    project: true,
                    tsconfigRootDir: import.meta.dirname,
                },
            },
            rules: {
                'astro/no-unused-css-selector': 'warn',
                '@typescript-eslint/restrict-template-expressions': 'off',
            },
        },
        {
            files: ['*.astro'],
            parser: 'astro-eslint-parser',
            parserOptions: {
                parser: '@typescript-eslint/parser',
                extraFileExtensions: ['.astro'],
                project: './tsconfig.eslint.json',
            },
        },
        { ignores: ['src/types/prismic.ts'] },
    ],
})
