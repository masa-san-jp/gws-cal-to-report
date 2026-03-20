import type { CalendarEvent } from '../calendar/types.js'

export interface WeeklySummary {
  totalEvents: number
  totalMinutes: number
  recurringCount: number
  uniqueAttendees: number
}

export interface DailyEvents {
  date: string
  events: CalendarEvent[]
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

export type ReportType = 'summary' | 'detailed' | 'business'
