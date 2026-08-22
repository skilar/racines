import { defineMiddleware } from 'astro:middleware'
import { getLangFromPath } from '@lib/i18n'

export const onRequest = defineMiddleware((context, next) => {
    context.locals.lang = getLangFromPath(context.url.pathname)

    return next()
})
