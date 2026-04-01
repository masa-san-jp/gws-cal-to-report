import { format, differenceInMinutes, parseISO } from 'date-fns'
import type { CalendarEvent } from './types.js'
import type { TransformResult, DailyEvents, AttendeeStats, WeeklySummary, EventDetail } from '../report/types.js'

function getEventDateTime(event: CalendarEvent): { start: Date; end: Date } {
  const startStr = 'dateTime' in event.start ? event.start.dateTime : event.start.date
  const endStr = 'dateTime' in event.end ? event.end.dateTime : event.end.date

  return {
    start: parseISO(startStr),
    end: parseISO(endStr)
  }
}

function calculateDuration(event: CalendarEvent): number {
  const { start, end } = getEventDateTime(event)
  return differenceInMinutes(end, start)
}

function extractEventDetail(event: CalendarEvent): EventDetail {
  const { start, end } = getEventDateTime(event)
  const durationMinutes = differenceInMinutes(end, start)

  const attendees = (event.attendees ?? [])
    .map(a => a.displayName ?? a.email)

  return {
    id: event.id,
    title: event.summary ?? '(無題)',
    startTime: format(start, 'HH:mm'),
    endTime: format(end, 'HH:mm'),
    durationMinutes,
    attendees,
    description: event.description,
    location: event.location,
    isRecurring: (event.recurrence ?? []).length > 0
  }
}

function groupByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const groups = new Map<string, CalendarEvent[]>()

  for (const event of events) {
    const { start } = getEventDateTime(event)
    const dateKey = format(start, 'yyyy-MM-dd')

    const existing = groups.get(dateKey) ?? []
    groups.set(dateKey, [...existing, event])
  }

  return groups
}

function collectAttendeeStats(events: CalendarEvent[]): AttendeeStats[] {
  const statsMap = new Map<string, AttendeeStats>()

  for (const event of events) {
    const attendees = event.attendees ?? []
    for (const attendee of attendees) {
      const existing = statsMap.get(attendee.email)
      if (existing) {
        statsMap.set(attendee.email, {
          ...existing,
          count: existing.count + 1
        })
      } else {
        statsMap.set(attendee.email, {
          email: attendee.email,
          displayName: attendee.displayName,
          count: 1
        })
      }
    }
  }

  return Array.from(statsMap.values())
    .sort((a, b) => b.count - a.count)
}

export function transformEvents(events: CalendarEvent[]): TransformResult {
  const grouped = groupByDate(events)

  const dailyEvents: DailyEvents[] = Array.from(grouped.entries())
    .map(([date, dayEvents]) => ({
      date,
      events: dayEvents,
      eventDetails: dayEvents.map(extractEventDetail),
      totalMinutes: dayEvents.reduce((sum, e) => sum + calculateDuration(e), 0)
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const totalMinutes = dailyEvents.reduce((sum, d) => sum + d.totalMinutes, 0)
  const recurringCount = events.filter(e => e.recurrence && e.recurrence.length > 0).length
  const attendeeStats = collectAttendeeStats(events)

  const summary: WeeklySummary = {
    totalEvents: events.length,
    totalMinutes,
    recurringCount,
    uniqueAttendees: attendeeStats.length
  }

  const eventTitles = events
    .map(e => e.summary ?? '(無題)')
    .filter((title, index, self) => self.indexOf(title) === index)

  return {
    summary,
    dailyEvents,
    attendeeStats,
    recurringRatio: events.length > 0 ? recurringCount / events.length : 0,
    eventTitles
  }
}
