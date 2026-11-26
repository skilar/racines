import { asDate } from '@prismicio/client'

import { LOCALES } from '@lib/i18n'

import type { Lang } from '@lib/i18n'
import type { WorkshopDocument } from '@typez/generated/prismic'

export type SessionLanguage = 'en' | 'fr'

export interface WorkshopSession {
    start: Date
    full: boolean
    language: SessionLanguage
}

/**
 * Sessions still to come, soonest first. The site is prerendered, so "now" is
 * the build time: a session drops off at the next build after it starts.
 */
export function getUpcomingSessions(
    sessions: WorkshopDocument['data']['sessions'] | undefined,
    now: Date = new Date(),
): WorkshopSession[] {
    return (sessions ?? [])
        .map((session) => ({
            start: asDate(session.start),
            full: session.full,
            // Typed as filled because the field has a default, but sessions
            // entered before the field existed still come back null
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            language: session.language ?? 'en',
        }))
        .filter(
            (session): session is WorkshopSession =>
                session.start !== null && session.start > now,
        )
        .sort((a, b) => a.start.getTime() - b.start.getTime())
}

/** Whether a session is taught in a language other than the page's. */
export function sessionLanguageDiffers(
    session: WorkshopSession,
    lang: Lang,
): boolean {
    return session.language !== LOCALES[lang].bcp47
}

export const SESSION_TIME_ZONE = 'Europe/Paris'

/**
 * Point a booking link at a session's day, using the `date` (YYYY-MM-DD) and
 * `timezone` parameters Wix Bookings calendars are meant to read. Sites that
 * don't know them ignore them. Relative links are left alone.
 */
export function withSessionDate(href: string, start: Date): string {
    let url: URL
    try {
        url = new URL(href)
    } catch {
        return href
    }

    // en-CA formats as YYYY-MM-DD
    const day = new Intl.DateTimeFormat('en-CA', {
        timeZone: SESSION_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(start)

    url.searchParams.set('date', day)
    url.searchParams.set('timezone', SESSION_TIME_ZONE)
    return url.toString()
}
