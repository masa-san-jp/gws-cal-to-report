import { execSync } from 'child_process'
import { CalendarResponseSchema, type CalendarEvent } from './types.js'

export interface FetchOptions {
  calendarId: string
  startDate: Date
  endDate: Date
}

export async function fetchCalendarEvents(options: FetchOptions): Promise<CalendarEvent[]> {
  const { calendarId, startDate, endDate } = options

  const timeMin = startDate.toISOString()
  const timeMax = endDate.toISOString()

  const params = JSON.stringify({
    calendarId,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 200
  })

  const command = `gws calendar events list --params '${params}'`

  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024
    })

    const json = JSON.parse(output)
    const validated = CalendarResponseSchema.parse(json)

    return validated.items ?? []
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('gws: command not found')) {
        throw new Error(
          'gws CLI not found. Install with: npm install -g @anthropic-ai/sdk\n' +
          'Then authenticate: gws auth login -s calendar'
        )
      }
      if (error.message.includes('invalid_grant') || error.message.includes('Token')) {
        throw new Error(
          'Authentication required. Run: gws auth login -s calendar'
        )
      }
    }
    throw error
  }
}
