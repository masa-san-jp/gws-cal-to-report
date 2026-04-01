import { z } from 'zod'

export const ConfigSchema = z.object({
  calendarId: z.string().default('primary'),
  periodDays: z.number().default(7),
  outputDir: z.string().default('./output'),
  reportType: z.enum(['summary', 'detailed', 'business', 'weekly']).default('weekly')
})

export type Config = z.infer<typeof ConfigSchema>

export function loadConfig(overrides: Partial<Config> = {}): Config {
  return ConfigSchema.parse({
    calendarId: process.env.CALENDAR_ID ?? 'primary',
    periodDays: 7,
    outputDir: process.env.REPORT_OUTPUT_DIR ?? './output',
    reportType: process.env.REPORT_TYPE ?? 'weekly',
    ...overrides
  })
}
