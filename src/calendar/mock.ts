import type { CalendarEvent } from './types.js'

export function generateMockEvents(): CalendarEvent[] {
  const now = new Date()
  const events: CalendarEvent[] = []

  const titles = [
    '定例MTG',
    'プロジェクトA 進捗確認',
    '1on1 ミーティング',
    'クライアント打合せ',
    '技術レビュー',
    'チームスタンドアップ',
    '企画ブレスト',
    '予算会議',
    'デザインレビュー',
    'スプリントプランニング'
  ]

  const attendees = [
    { email: 'tanaka@example.com', displayName: '田中太郎' },
    { email: 'suzuki@example.com', displayName: '鈴木花子' },
    { email: 'yamamoto@example.com', displayName: '山本次郎' },
    { email: 'sato@example.com', displayName: '佐藤美咲' },
    { email: 'watanabe@example.com', displayName: '渡辺健一' }
  ]

  for (let day = 0; day < 7; day++) {
    const eventsPerDay = Math.floor(Math.random() * 4) + 2

    for (let i = 0; i < eventsPerDay; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - day)
      date.setHours(9 + i * 2, 0, 0, 0)

      const endDate = new Date(date)
      endDate.setMinutes(endDate.getMinutes() + 30 + Math.floor(Math.random() * 60))

      const eventAttendees = attendees
        .slice(0, Math.floor(Math.random() * 4) + 1)
        .map(a => ({ ...a, responseStatus: 'accepted' as const }))

      events.push({
        id: `event-${day}-${i}`,
        summary: titles[Math.floor(Math.random() * titles.length)],
        start: { dateTime: date.toISOString() },
        end: { dateTime: endDate.toISOString() },
        attendees: eventAttendees,
        organizer: { email: 'me@example.com', displayName: '自分', self: true },
        recurrence: Math.random() > 0.7 ? ['RRULE:FREQ=WEEKLY'] : undefined
      })
    }
  }

  return events.sort((a, b) => {
    const aTime = 'dateTime' in a.start ? a.start.dateTime : a.start.date
    const bTime = 'dateTime' in b.start ? b.start.dateTime : b.start.date
    return aTime.localeCompare(bTime)
  })
}
