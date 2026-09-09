import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import eslintPluginAstro from 'eslint-plugin-astro'
import eslintConfigPrettier from 'eslint-config-prettier'

export default defineConfig([
    {
        ignores: [
            'src/types/generated/*',
            'dist/**',
            '.astro/**',
            '.netlify/**',
        ],
    },
    {
        files: ['**/*.{js,ts,astro}'],
        extends: [
            js.configs.recommended,
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.stylisticTypeChecked,
            eslintConfigPrettier,
        ],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            '@typescript-eslint/restrict-template-expressions': 'off',
        },
    },
    ...eslintPluginAstro.configs['flat/recommended'],
    {
        files: ['**/*.astro'],
        languageOptions: {
            parserOptions: {
                parser: tseslint.parser,
                extraFileExtensions: ['.astro'],
                projectService: false,
                project: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            // JSX inside .astro files is typed as an error type by the
            // parser, so every `.map(() => <li />)` trips this rule.
            '@typescript-eslint/no-unsafe-return': 'off',
        },
    },
])
