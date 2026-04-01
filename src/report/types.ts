import type { CalendarEvent } from '../calendar/types.js'

export interface WeeklySummary {
  totalEvents: number
  totalMinutes: number
  recurringCount: number
  uniqueAttendees: number
}

export interface EventDetail {
  id: string
  title: string
  startTime: string
  endTime: string
  durationMinutes: number
  attendees: string[]
  description?: string
  location?: string
  isRecurring: boolean
}

export interface DailyEvents {
  date: string
  events: CalendarEvent[]
  eventDetails: EventDetail[]
  totalMinutes: number
}

export interface AttendeeStats {
  email: string
  displayName?: string
  count: number
}

export interface TransformResult {
  summary: WeeklySummary
  dailyEvents: DailyEvents[]
  attendeeStats: AttendeeStats[]
  recurringRatio: number
  eventTitles: string[]
}

export interface Report {
  generatedAt: string
  period: { start: string; end: string }
  content: string
}

export type ReportType = 'summary' | 'detailed' | 'business' | 'weekly'
