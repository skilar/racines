import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildCalendarMonths, getVenueDate } from './tickettailor.ts'

import type { CalendarDay, TTOccurrence } from './tickettailor.ts'

const TZ = 'Europe/Paris'

// Builds an occurrence from a Paris wall-clock start, e.g. `2026-11-27T14:00:00+01:00`
const occurrence = (
    iso: string,
    overrides: Partial<TTOccurrence> = {},
): TTOccurrence => {
    const unix = Date.parse(iso) / 1000

    return {
        end: { date: iso.slice(0, 10), unix: unix + 9000 },
        hidden: 'false',
        id: `ev_${unix}`,
        max_tickets_sold_per_occurrence: null,
        start: { date: iso.slice(0, 10), unix },
        ticket_types: [{ quantity: 8, status: 'on_sale' }],
        tickets_available: 'true',
        total_issued_tickets: 0,
        unavailable: 'false',
        url: `https://www.tickettailor.com/checkout/view-event/id/${unix}/`,
        ...overrides,
    }
}

const NOW = new Date('2026-10-27T12:00:00+01:00')

// French calendars start on Monday
const OPTIONS = { firstDayOfWeek: 1, now: NOW, timeZone: TZ }

const findDay = (
    months: ReturnType<typeof buildCalendarMonths>,
    date: string,
): CalendarDay | undefined =>
    months
        .flatMap((m) => m.weeks.flat())
        .find((d): d is CalendarDay => d?.date === date)

describe('getVenueDate', () => {
    it('uses the venue’s date, not UTC', () => {
        // 23:30 UTC on 31 Oct is already 1 Nov in Paris
        assert.equal(
            getVenueDate(new Date('2026-10-31T23:30:00Z'), TZ),
            '2026-11-01',
        )
    })
})

describe('buildCalendarMonths', () => {
    it('returns nothing when there are no upcoming occurrences', () => {
        assert.deepEqual(buildCalendarMonths([], OPTIONS), [])
        assert.deepEqual(
            buildCalendarMonths(
                [occurrence('2026-10-01T14:00:00+02:00')],
                OPTIONS,
            ),
            [],
        )
    })

    it('spans from the first to the last session’s month, including empty months between', () => {
        const months = buildCalendarMonths(
            [
                occurrence('2027-01-09T14:00:00+01:00'),
                occurrence('2026-11-07T14:00:00+01:00'),
            ],
            OPTIONS,
        )

        assert.deepEqual(
            months.map((m) => m.id),
            ['2026-11', '2026-12', '2027-01'],
        )
    })

    it('lays out Monday-first weeks padded to seven days', () => {
        const [november] = buildCalendarMonths(
            [occurrence('2026-11-07T14:00:00+01:00')],
            OPTIONS,
        )
        const weeks = november?.weeks ?? []

        // 1 November 2026 is a Sunday
        assert.deepEqual(
            weeks[0]?.map((d) => d?.day ?? null),
            [null, null, null, null, null, null, 1],
        )
        assert.ok(weeks.every((week) => week.length === 7))
        assert.equal(weeks.flat().filter(Boolean).length, 30)
    })

    it('starts weeks on Sunday when asked', () => {
        const [november] = buildCalendarMonths(
            [occurrence('2026-11-07T14:00:00+01:00')],
            { ...OPTIONS, firstDayOfWeek: 0 },
        )
        const weeks = november?.weeks ?? []

        // 1 November 2026 is a Sunday, so it opens the first row
        assert.equal(weeks[0]?.[0]?.day, 1)
        assert.equal(weeks.flat().filter(Boolean).length, 30)
    })

    it('groups several sessions on one day in start order', () => {
        const months = buildCalendarMonths(
            [
                occurrence('2026-11-07T15:00:00+01:00'),
                occurrence('2026-11-07T10:00:00+01:00'),
            ],
            OPTIONS,
        )

        const day = findDay(months, '2026-11-07')

        assert.deepEqual(
            day?.sessions.map((s) => s.start.toISOString()),
            ['2026-11-07T09:00:00.000Z', '2026-11-07T14:00:00.000Z'],
        )
    })

    it('marks days before today as past', () => {
        const months = buildCalendarMonths(
            [occurrence('2026-10-30T14:00:00+01:00')],
            OPTIONS,
        )

        assert.equal(findDay(months, '2026-10-26')?.isPast, true)
        assert.equal(findDay(months, '2026-10-27')?.isPast, false)
    })

    it('skips hidden occurrences', () => {
        const months = buildCalendarMonths(
            [
                occurrence('2026-11-07T14:00:00+01:00'),
                occurrence('2026-11-14T14:00:00+01:00', { hidden: 'true' }),
            ],
            OPTIONS,
        )

        assert.equal(findDay(months, '2026-11-14')?.sessions.length, 0)
    })

    it('counts spots left from on-sale ticket types, capped per occurrence', () => {
        const months = buildCalendarMonths(
            [
                occurrence('2026-11-07T14:00:00+01:00', {
                    ticket_types: [
                        { quantity: 3, status: 'on_sale' },
                        { quantity: 2, status: 'on_sale' },
                        { quantity: 9, status: 'hidden' },
                    ],
                }),
                occurrence('2026-11-14T14:00:00+01:00', {
                    max_tickets_sold_per_occurrence: 8,
                    total_issued_tickets: 6,
                }),
            ],
            OPTIONS,
        )

        assert.equal(findDay(months, '2026-11-07')?.sessions[0]?.spotsLeft, 5)
        assert.equal(findDay(months, '2026-11-14')?.sessions[0]?.spotsLeft, 2)
    })

    it('treats no spots, unavailable or closed sales as sold out', () => {
        const months = buildCalendarMonths(
            [
                occurrence('2026-11-07T14:00:00+01:00', {
                    ticket_types: [{ quantity: 0, status: 'sold_out' }],
                }),
                occurrence('2026-11-08T14:00:00+01:00', {
                    unavailable: 'true',
                }),
                occurrence('2026-11-09T14:00:00+01:00', {
                    tickets_available: 'false',
                }),
                occurrence('2026-11-10T14:00:00+01:00'),
            ],
            OPTIONS,
        )

        assert.deepEqual(
            ['07', '08', '09', '10'].map(
                (d) => findDay(months, `2026-11-${d}`)?.sessions[0]?.soldOut,
            ),
            [true, true, true, false],
        )
    })

    it('files sessions under the venue’s date, not the UTC one', () => {
        // 00:30 in Paris on the night clocks go forward is still the 27th in UTC
        const months = buildCalendarMonths(
            [occurrence('2027-03-28T00:30:00+01:00')],
            OPTIONS,
        )

        assert.equal(findDay(months, '2027-03-28')?.sessions.length, 1)
        assert.equal(findDay(months, '2027-03-27')?.sessions.length, 0)
    })
})
