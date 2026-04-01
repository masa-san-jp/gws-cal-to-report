import { generateWithClaude } from '../lib/claude.js'
import type { TransformResult, Report, ReportType, EventDetail } from './types.js'

interface GenerateOptions {
  data: TransformResult
  reportType: ReportType
  period: { start: string; end: string }
}

function formatEventForPrompt(event: EventDetail): object {
  return {
    title: event.title,
    time: `${event.startTime}-${event.endTime}`,
    duration: `${event.durationMinutes}分`,
    attendees: event.attendees.length > 0 ? event.attendees : undefined,
    description: event.description ? event.description.slice(0, 500) : undefined,
    location: event.location,
    isRecurring: event.isRecurring
  }
}

function buildWeeklyPrompt(options: GenerateOptions): string {
  const { data, period } = options
  const { summary, dailyEvents, attendeeStats } = data

  const dailyDetails = dailyEvents.map(d => ({
    date: d.date,
    totalMinutes: d.totalMinutes,
    events: d.eventDetails.map(formatEventForPrompt)
  }))

  const topAttendees = attendeeStats
    .slice(0, 10)
    .map(a => `${a.displayName ?? a.email} (${a.count}件)`)

  const detailedData = {
    period: `${period.start} ~ ${period.end}`,
    summary: {
      totalEvents: summary.totalEvents,
      totalMinutes: summary.totalMinutes,
      totalHours: Math.round(summary.totalMinutes / 60 * 10) / 10,
      uniqueAttendees: summary.uniqueAttendees
    },
    topCollaborators: topAttendees,
    dailyActivities: dailyDetails
  }

  return `
あなたは週報作成アシスタントです。以下のGoogleカレンダーデータから、社内共有用の週次活動レポートを作成してください。

## 入力データ
\`\`\`json
${JSON.stringify(detailedData, null, 2)}
\`\`\`

## 出力形式
Markdown形式で、以下の構成で出力してください。

### 必須セクション

1. **今週のサマリー**
   - 会議数と総時間
   - 主な協業先（よく会議した人）
   - 今週の主要な活動トピック（3-5個）

2. **日別活動詳細**
   - 各日ごとにセクションを作成
   - 各イベントについて以下を記載:
     - タイトルと時間
     - 参加者
     - 内容（descriptionから要約。なければタイトルから推測）
     - 決定事項やアクションアイテム（推測可能な場合）

3. **今週の主要トピック**
   - 会議タイトルやdescriptionからプロジェクトや案件ごとにグルーピング
   - 各トピックの進捗や状況を簡潔にまとめる

4. **来週に向けて**（任意）
   - 継続案件や予定があれば記載

## 注意事項
- 社内で共有する週報として使えるフォーマットにしてください
- 具体的な活動内容が分かるように記載してください
- descriptionがある場合は、その内容を要約して反映してください
- 参加者名は敬称略で記載してください
`
}

function buildPrompt(options: GenerateOptions): string {
  const { data, reportType, period } = options

  if (reportType === 'weekly') {
    return buildWeeklyPrompt(options)
  }

  const { summary, dailyEvents, attendeeStats, recurringRatio, eventTitles } = data

  const dailySummary = dailyEvents.map(d => ({
    date: d.date,
    count: d.events.length,
    minutes: d.totalMinutes
  }))

  const topAttendees = attendeeStats
    .slice(0, 10)
    .map(a => `${a.displayName ?? a.email} (${a.count}件)`)

  const compressedData = {
    period: `${period.start} ~ ${period.end}`,
    summary: {
      totalEvents: summary.totalEvents,
      totalMinutes: summary.totalMinutes,
      totalHours: Math.round(summary.totalMinutes / 60 * 10) / 10,
      recurringCount: summary.recurringCount,
      recurringRatio: Math.round(recurringRatio * 100),
      uniqueAttendees: summary.uniqueAttendees
    },
    daily: dailySummary,
    topAttendees,
    eventTitles: eventTitles.slice(0, 30)
  }

  const baseInstruction = `
あなたはビジネスアナリストです。以下のGoogleカレンダーデータを分析し、週次活動レポートを作成してください。

## 入力データ
\`\`\`json
${JSON.stringify(compressedData, null, 2)}
\`\`\`

## 出力形式
Markdown形式で出力してください。
`

  const typeInstructions: Record<Exclude<ReportType, 'weekly'>, string> = {
    summary: `
## 要求
簡潔なサマリーレポートを作成してください。
- 総会議数と総時間
- 日別の傾向
- 主要な参加者
`,
    detailed: `
## 要求
詳細なレポートを作成してください。
- 総会議数と総時間
- 日別の詳細分析
- 会議テーマの分類
- 参加者分析
- 定例会議の比率と考察
`,
    business: `
## 要求
ビジネスインサイトを含む詳細レポートを作成してください。

### 必須セクション
1. **エグゼクティブサマリー**: 1-2文で週の活動を要約
2. **数値サマリー**: 会議数、総時間、参加者数
3. **日別分析**: 各日の活動傾向
4. **テーマ分析**: 会議タイトルから推測される主要テーマ
5. **ビジネスインサイト**:
   - 時間配分の偏り
   - 改善提案
   - 注目すべきパターン
`
  }

  return baseInstruction + typeInstructions[reportType]
}

export async function generateReport(options: GenerateOptions): Promise<Report> {
  const prompt = buildPrompt(options)

  const content = await generateWithClaude(prompt, {
    maxTokens: 2000,
    temperature: 0.3
  })

  return {
    generatedAt: new Date().toISOString(),
    period: options.period,
    content
  }
}
