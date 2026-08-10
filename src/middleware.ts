import { defineMiddleware } from 'astro:middleware'
import { getPathByLocale } from 'astro:i18n'

export const onRequest = defineMiddleware((ctx, next) => {
    const locale = getPathByLocale(ctx.preferredLocale || '')
    const localeSlug = `/${locale}/`

    if (!ctx.url.pathname.startsWith(localeSlug)) {
        return ctx.redirect(localeSlug)
    }

    return next()
})
