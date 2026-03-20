import 'dotenv/config'
import { writeFileSync, mkdirSync } from 'fs'
import { format, subDays } from 'date-fns'
import { fetchCalendarEvents } from './calendar/fetch.js'
import { generateMockEvents } from './calendar/mock.js'
import { transformEvents } from './calendar/transform.js'
import { generateReport } from './report/generate.js'
import { loadConfig } from './lib/config.js'
import type { ReportType } from './report/types.js'

function parseArgs(): { start?: Date; end?: Date; reportType?: ReportType; mock?: boolean } {
  const args = process.argv.slice(2)
  const result: { start?: Date; end?: Date; reportType?: ReportType; mock?: boolean } = {}

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--start' && args[i + 1]) {
      result.start = new Date(args[i + 1])
      i++
    } else if (args[i] === '--end' && args[i + 1]) {
      result.end = new Date(args[i + 1])
      i++
    } else if (args[i] === '--type' && args[i + 1]) {
      result.reportType = args[i + 1] as ReportType
      i++
    } else if (args[i] === '--mock') {
      result.mock = true
    }
  }

  return result
}

async function main() {
  const config = loadConfig()
  const args = parseArgs()

  const endDate = args.end ?? new Date()
  const startDate = args.start ?? subDays(endDate, config.periodDays)
  const reportType = args.reportType ?? config.reportType

  const periodStart = format(startDate, 'yyyy-MM-dd')
  const periodEnd = format(endDate, 'yyyy-MM-dd')

  console.log(`Fetching calendar events: ${periodStart} ~ ${periodEnd}`)

  let events
  if (args.mock) {
    console.log('Using mock data...')
    events = generateMockEvents()
  } else {
    events = await fetchCalendarEvents({
      calendarId: config.calendarId,
      startDate,
      endDate
    })
  }

  console.log(`Found ${events.length} events`)

  if (events.length === 0) {
    console.log('No events found in the specified period.')
    return
  }

  const transformed = transformEvents(events)

  console.log('Generating report with Claude...')

  const report = await generateReport({
    data: transformed,
    reportType,
    period: { start: periodStart, end: periodEnd }
  })

  mkdirSync(config.outputDir, { recursive: true })

  const outputPath = `${config.outputDir}/report-${periodStart}-${periodEnd}.md`
  const outputContent = `# 週次活動レポート

生成日時: ${report.generatedAt}
対象期間: ${report.period.start} ~ ${report.period.end}

---

${report.content}
`

  writeFileSync(outputPath, outputContent, 'utf-8')
  console.log(`Report saved to: ${outputPath}`)
}

main().catch(error => {
  console.error('Error:', error.message)
  process.exit(1)
})
