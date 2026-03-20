import { z } from 'zod'

export const AttendeeSchema = z.object({
  email: z.string(),
  displayName: z.string().optional(),
  responseStatus: z.enum(['accepted', 'declined', 'tentative', 'needsAction']).optional()
})

export const OrganizerSchema = z.object({
  email: z.string(),
  displayName: z.string().optional(),
  self: z.boolean().optional()
})

export const CalendarEventSchema = z.object({
  id: z.string(),
  summary: z.string().optional(),
  description: z.string().optional(),
  start: z.union([
    z.object({ dateTime: z.string() }),
    z.object({ date: z.string() })
  ]),
  end: z.union([
    z.object({ dateTime: z.string() }),
    z.object({ date: z.string() })
  ]),
  attendees: z.array(AttendeeSchema).optional(),
  organizer: OrganizerSchema.optional(),
  location: z.string().optional(),
  recurrence: z.array(z.string()).optional()
})

export const CalendarResponseSchema = z.object({
  items: z.array(CalendarEventSchema).optional()
})

export type Attendee = z.infer<typeof AttendeeSchema>
export type Organizer = z.infer<typeof OrganizerSchema>
export type CalendarEvent = z.infer<typeof CalendarEventSchema>
export type CalendarResponse = z.infer<typeof CalendarResponseSchema>
