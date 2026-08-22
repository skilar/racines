import { createFixer } from '@skilar/jolitypo-ts'
import { LOCALES } from '@lib/i18n'

import type { JoliTypo } from '@skilar/jolitypo-ts'
import type { Lang } from '@lib/i18n'

const fixers = new Map<Lang, JoliTypo>()

export default function getFixer(lang: Lang): JoliTypo {
    const cached = fixers.get(lang)

    if (cached) {
        return cached
    }

    const fixer = createFixer({ locale: LOCALES[lang].og })
    fixers.set(lang, fixer)

    return fixer
}
