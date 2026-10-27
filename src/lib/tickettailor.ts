export const TICKET_TAILOR_TIME_ZONE = 'Europe/Paris'

// Ticket Tailor's API returns booleans as the strings 'true' and 'false'.
type TTBoolean = 'true' | 'false'

interface TTDateTime {
    // Calendar date at the venue, e.g. `2026-11-27`
    date: string
    unix: number
}

export interface TTTicketType {
    // Number still available for purchase
    quantity: number
    status:
        | 'on_sale'
        | 'sold_out'
        | 'unavailable'
        | 'hidden'
        | 'admin_only'
        | 'locked'
}

export interface TTOccurrence {
    end: TTDateTime
    hidden: TTBoolean
    id: string
    max_tickets_sold_per_occurrence: number | null
    start: TTDateTime
    ticket_types: TTTicketType[]
    tickets_available: TTBoolean
    total_issued_tickets: number
    unavailable: TTBoolean
    // Ticket selection page for this occurrence
    url: string
}

export interface CalendarSession {
    end: Date
    id: string
    soldOut: boolean
    spotsLeft: number
    start: Date
    url: string
}

export interface CalendarDay {
    // `YYYY-MM-DD`, as Ticket Tailor reports it at the venue
    date: string
    day: number
    isPast: boolean
    sessions: CalendarSession[]
}

export interface CalendarMonth {
    // `YYYY-MM`
    id: string
    month: number
    // Rows of seven from the locale's first weekday; `null` pads days outside
    // the month
    weeks: (CalendarDay | null)[][]
    year: number
}

const pad = (n: number) => String(n).padStart(2, '0')

const getSpotsLeft = (occurrence: TTOccurrence): number => {
    const onSale = occurrence.ticket_types
        .filter((type) => type.status === 'on_sale')
        .reduce((sum, type) => sum + type.quantity, 0)

    const cap = occurrence.max_tickets_sold_per_occurrence

    return cap === null
        ? onSale
        : Math.min(onSale, cap - occurrence.total_issued_tickets)
}

const toSession = (occurrence: TTOccurrence): CalendarSession => {
    const spotsLeft = Math.max(0, getSpotsLeft(occurrence))

    return {
        end: new Date(occurrence.end.unix * 1000),
        id: occurrence.id,
        soldOut:
            spotsLeft === 0 ||
            occurrence.tickets_available !== 'true' ||
            occurrence.unavailable === 'true',
        spotsLeft,
        start: new Date(occurrence.start.unix * 1000),
        url: occurrence.url,
    }
}

// Today's date at the venue as `YYYY-MM-DD`
export const getVenueDate = (now: Date, timeZone: string): string => {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en', {
            day: '2-digit',
            month: '2-digit',
            timeZone,
            year: 'numeric',
        })
            .formatToParts(now)
            .map(({ type, value }) => [type, value]),
    )

    return `${parts.year}-${parts.month}-${parts.day}`
}

export interface BuildCalendarMonthsConfig {
    firstDayOfWeek: number
    now: Date
    timeZone: string
}

// Lays out upcoming occurrences as month grids, from the month of the first
// upcoming session through the month of the last. `firstDayOfWeek` follows
// `Date.getUTCDay()`: 0 for Sunday, 1 for Monday.
export const buildCalendarMonths = (
    occurrences: TTOccurrence[],
    { firstDayOfWeek, now, timeZone }: BuildCalendarMonthsConfig,
): CalendarMonth[] => {
    const nowUnix = now.getTime() / 1000
    const today = getVenueDate(now, timeZone)

    const upcoming = occurrences
        .filter((o) => o.hidden !== 'true' && o.start.unix > nowUnix)
        .sort((a, b) => a.start.unix - b.start.unix)

    const first = upcoming[0]
    const last = upcoming.at(-1)

    if (!first || !last) {
        return []
    }

    const sessionsByDate = new Map<string, CalendarSession[]>()

    for (const occurrence of upcoming) {
        const sessions = sessionsByDate.get(occurrence.start.date) ?? []
        sessions.push(toSession(occurrence))
        sessionsByDate.set(occurrence.start.date, sessions)
    }

    let [year, month] = first.start.date.split('-').map(Number) as [
        number,
        number,
    ]
    const lastMonthId = last.start.date.slice(0, 7)
    const months: CalendarMonth[] = []

    while (`${year}-${pad(month)}` <= lastMonthId) {
        // Date.UTC keeps this pure calendar arithmetic, with no time zone
        const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
        const leading =
            (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() -
                firstDayOfWeek +
                7) %
            7

        const cells: (CalendarDay | null)[] = Array.from(
            { length: leading },
            () => null,
        )

        for (let day = 1; day <= daysInMonth; day++) {
            const date = `${year}-${pad(month)}-${pad(day)}`

            cells.push({
                date,
                day,
                isPast: date < today,
                sessions: sessionsByDate.get(date) ?? [],
            })
        }

        while (cells.length % 7 !== 0) {
            cells.push(null)
        }

        const weeks: (CalendarDay | null)[][] = []

        for (let i = 0; i < cells.length; i += 7) {
            weeks.push(cells.slice(i, i + 7))
        }

        months.push({ id: `${year}-${pad(month)}`, month, weeks, year })

        if (month === 12) {
            month = 1
            year++
        } else {
            month++
        }
    }

    return months
}
