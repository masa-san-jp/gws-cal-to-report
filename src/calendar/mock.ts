import type { CalendarEvent } from './types.js'

interface MockEventTemplate {
  title: string
  descriptions: string[]
}

const eventTemplates: MockEventTemplate[] = [
  {
    title: '定例MTG',
    descriptions: [
      '【議題】\n- 先週の振り返り\n- 今週の予定共有\n- 課題の確認',
      '【アジェンダ】\n1. 進捗報告\n2. ブロッカーの共有\n3. 来週の計画'
    ]
  },
  {
    title: 'プロジェクトA 進捗確認',
    descriptions: [
      '【目的】フェーズ2の進捗確認とリリース日程の調整\n【決定事項】4/5にβ版リリース予定',
      '【議題】\n- 開発進捗の確認\n- テスト計画のレビュー\n- リソース調整'
    ]
  },
  {
    title: '1on1 ミーティング',
    descriptions: [
      'キャリア面談・Q2目標設定について',
      '業務の振り返りと今後のキャリアについて相談'
    ]
  },
  {
    title: 'クライアントX社 打合せ',
    descriptions: [
      '【目的】契約更新に関する交渉\n【参加者】X社: 山田部長、佐々木課長\n【議題】来期の契約内容確認',
      '【議題】新規案件の要件ヒアリング\n【持ち物】提案資料v2'
    ]
  },
  {
    title: '技術レビュー',
    descriptions: [
      '【対象】認証機能のコードレビュー\n【レビューポイント】セキュリティ、パフォーマンス',
      'API設計レビュー - REST vs GraphQL の比較検討'
    ]
  },
  {
    title: 'チームスタンドアップ',
    descriptions: [
      '毎朝の進捗共有（15分）',
      'デイリースクラム - 昨日やったこと、今日やること、困っていること'
    ]
  },
  {
    title: '企画ブレスト',
    descriptions: [
      '【テーマ】新機能アイデア出し\n【目標】10個以上のアイデアを出す',
      'Q3施策のブレインストーミング - 顧客フィードバックを基に'
    ]
  },
  {
    title: '予算会議',
    descriptions: [
      '【議題】Q2予算の執行状況確認と調整\n【資料】予算管理シート参照',
      '来期予算計画の策定 - 各部門からの要望ヒアリング'
    ]
  },
  {
    title: 'デザインレビュー',
    descriptions: [
      '【対象】新規LP のデザイン確認\n【フィードバック期限】3/28',
      'モバイルアプリUIの最終確認 - 開発着手前の最終チェック'
    ]
  },
  {
    title: 'スプリントプランニング',
    descriptions: [
      '【スプリント目標】認証機能の実装完了\n【見積もり】チームキャパ: 40pt',
      'Sprint 12 計画 - バックログの優先順位付けとタスク分解'
    ]
  }
]

const attendees = [
  { email: 'tanaka@example.com', displayName: '田中太郎' },
  { email: 'suzuki@example.com', displayName: '鈴木花子' },
  { email: 'yamamoto@example.com', displayName: '山本次郎' },
  { email: 'sato@example.com', displayName: '佐藤美咲' },
  { email: 'watanabe@example.com', displayName: '渡辺健一' }
]

export function generateMockEvents(): CalendarEvent[] {
  const now = new Date()
  const events: CalendarEvent[] = []

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

      const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)]
      const description = template.descriptions[Math.floor(Math.random() * template.descriptions.length)]

      events.push({
        id: `event-${day}-${i}`,
        summary: template.title,
        description,
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
