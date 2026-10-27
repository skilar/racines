import { TICKET_TAILOR_API_KEY } from 'astro:env/server'

import type { TTOccurrence } from '@lib/tickettailor'

const API_URL = 'https://api.tickettailor.com'

// Enough for a couple of years of weekly sessions
const MAX_PAGES = 5

interface TTList<T> {
    data: T[]
    links: { next: string | null }
}

export const getUpcomingOccurrences = async (
    eventSeriesId: string,
): Promise<TTOccurrence[] | null> => {
    if (!TICKET_TAILOR_API_KEY) {
        console.error('TICKET_TAILOR_API_KEY is not set.')

        return null
    }

    const params = new URLSearchParams({
        limit: '100',
        'start_at.gte': String(Math.floor(Date.now() / 1000)),
    })
    let path: string | null =
        `/v1/event_series/${encodeURIComponent(eventSeriesId)}/events?${params}`
    const occurrences: TTOccurrence[] = []

    try {
        for (let page = 0; path && page < MAX_PAGES; page++) {
            const response = await fetch(new URL(path, API_URL), {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Basic ${btoa(`${TICKET_TAILOR_API_KEY}:`)}`,
                },
                signal: AbortSignal.timeout(5000),
            })

            if (!response.ok) {
                throw new Error(`${response.status} ${await response.text()}`)
            }

            const list = (await response.json()) as TTList<TTOccurrence>

            occurrences.push(...list.data)
            path = list.links.next
        }
    } catch (error) {
        console.error(
            `Couldn’t fetch Ticket Tailor occurrences for ${eventSeriesId}:`,
            error,
        )

        return null
    }

    return occurrences
}
