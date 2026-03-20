# Googleカレンダー週次レポート生成 設計仕様書

作成日: 2026-03-19
ステータス: Draft
参照: log/20260319-calendar-report-design.md

---

## 1. システム概要

### 1.1 目的
Googleカレンダーから1週間分のイベントを取得し、活動分析とビジネスレポートを自動生成する。

### 1.2 システム構成図

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  gws CLI    │────▶│  Transform  │────▶│  Claude API │────▶│   Output    │
│  (fetch)    │     │  (整形)     │     │  (sonnet)   │     │  (Markdown) │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │                   │
      ▼                   ▼                   ▼                   ▼
 calendar.json      events.json         analysis.json       report.md
```

---

## 2. 技術仕様

### 2.1 技術スタック

| 項目 | 技術 | バージョン |
|------|------|-----------|
| ランタイム | Node.js | >= 20.x |
| 言語 | TypeScript | >= 5.x |
| データ取得 | gws CLI | latest |
| LLM | Claude API (sonnet-4.6) | - |
| バリデーション | zod | >= 3.x |

### 2.2 依存関係

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.x",
    "zod": "^3.x",
    "date-fns": "^3.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/node": "^20.x"
  }
}
```

---

## 3. モジュール設計

### 3.1 ディレクトリ構成

```
src/
├── index.ts              # エントリポイント
├── calendar/
│   ├── fetch.ts          # gws CLI呼び出し
│   ├── transform.ts      # データ整形
│   └── types.ts          # 型定義
├── report/
│   ├── generate.ts       # レポート生成
│   ├── templates.ts      # 出力テンプレート
│   └── types.ts          # 型定義
└── lib/
    ├── claude.ts         # Claude API クライアント
    └── config.ts         # 設定管理
```

### 3.2 モジュール詳細

#### 3.2.1 `src/calendar/fetch.ts`

```typescript
interface FetchOptions {
  calendarId: string      // default: "primary"
  startDate: Date         // 取得開始日
  endDate: Date           // 取得終了日
}

async function fetchCalendarEvents(options: FetchOptions): Promise<CalendarEvent[]>
```

**処理内容:**
1. gws CLIを子プロセスとして実行
2. JSON出力をパース
3. バリデーション後に返却

**gws CLIコマンド:**
```bash
gws calendar events list \
  --params '{
    "calendarId": "primary",
    "timeMin": "2026-03-12T00:00:00Z",
    "timeMax": "2026-03-19T23:59:59Z",
    "singleEvents": true,
    "orderBy": "startTime",
    "maxResults": 200
  }' \
  --fields "items(id,summary,description,start,end,attendees,organizer,location,recurrence)"
```

#### 3.2.2 `src/calendar/transform.ts`

```typescript
interface TransformResult {
  summary: WeeklySummary
  dailyEvents: DailyEvents[]
  attendeeStats: AttendeeStats[]
  recurringRatio: number
}

function transformEvents(events: CalendarEvent[]): TransformResult
```

**処理内容:**
1. 日別グループ化
2. 会議時間の集計（分単位）
3. 参加者の出現頻度カウント
4. 定例/単発の判定（recurrenceフィールド有無）

#### 3.2.3 `src/report/generate.ts`

```typescript
interface ReportOptions {
  data: TransformResult
  reportType: 'summary' | 'detailed' | 'business'
}

async function generateReport(options: ReportOptions): Promise<string>
```

**処理内容:**
1. TransformResultをプロンプト用に圧縮
2. Claude API (sonnet-4.6) 呼び出し
3. Markdown形式でレポート生成

---

## 4. データ型定義

### 4.1 入力データ型

```typescript
// gws CLIから取得するイベント
interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: { dateTime: string } | { date: string }
  end: { dateTime: string } | { date: string }
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus: 'accepted' | 'declined' | 'tentative' | 'needsAction'
  }>
  organizer: {
    email: string
    displayName?: string
    self?: boolean
  }
  location?: string
  recurrence?: string[]
}
```

### 4.2 中間データ型

```typescript
interface WeeklySummary {
  totalEvents: number
  totalMinutes: number
  recurringCount: number
  uniqueAttendees: number
}

interface DailyEvents {
  date: string              // YYYY-MM-DD
  events: CalendarEvent[]
  totalMinutes: number
}

interface AttendeeStats {
  email: string
  displayName?: string
  count: number
}
```

### 4.3 出力データ型

```typescript
interface Report {
  generatedAt: string
  period: { start: string; end: string }
  content: string           // Markdown
}
```

---

## 5. LLM連携仕様

### 5.1 Claude API設定

```typescript
const claudeConfig = {
  model: 'claude-sonnet-4-6-20260101',
  max_tokens: 2000,
  temperature: 0.3
}
```

### 5.2 プロンプト設計

**入力（圧縮済みデータのみ）:**
```json
{
  "period": "2026-03-12 ~ 2026-03-19",
  "summary": { "totalEvents": 25, "totalMinutes": 1200, ... },
  "daily": [{ "date": "2026-03-12", "count": 5, "minutes": 240 }, ...],
  "topAttendees": ["user1@example.com (8)", "user2@example.com (5)"],
  "eventTitles": ["定例MTG", "1on1", "プロジェクトA進捗", ...]
}
```

**出力形式:**
```markdown
# 週次活動レポート (2026-03-12 ~ 2026-03-19)

## サマリー
- 総会議数: 25件
- 総会議時間: 20時間
...

## 日別分析
...

## ビジネスインサイト
...
```

---

## 6. エラーハンドリング

| エラー種別 | 対処 |
|-----------|------|
| gws CLI認証エラー | エラーメッセージ表示、`gws auth login`案内 |
| APIレート制限 | リトライ（exponential backoff） |
| Claude API エラー | エラーログ出力、フォールバック無し |
| データバリデーション失敗 | 該当イベントをスキップ、警告ログ |

---

## 7. 設定ファイル

### 7.1 環境変数

```bash
ANTHROPIC_API_KEY=sk-ant-...   # 必須
CALENDAR_ID=primary             # オプション
REPORT_OUTPUT_DIR=./output      # オプション
```

### 7.2 設定スキーマ

```typescript
const ConfigSchema = z.object({
  calendarId: z.string().default('primary'),
  periodDays: z.number().default(7),
  outputDir: z.string().default('./output'),
  reportType: z.enum(['summary', 'detailed', 'business']).default('business')
})
```

---

## 8. 実行方法

```bash
# 認証（初回のみ）
gws auth login -s calendar

# レポート生成
npx ts-node src/index.ts

# 期間指定
npx ts-node src/index.ts --start 2026-03-01 --end 2026-03-07
```

---

## 9. テスト方針

| テスト種別 | 対象 | ツール |
|-----------|------|--------|
| ユニット | transform.ts | vitest |
| 統合 | fetch → transform | vitest + mock |
| E2E | 全体フロー | 手動確認 |

---

## 10. 今後の拡張候補

- Gmail連携（UC-02対応）
- Google Chat連携（UC-03対応）
- Sheets出力
- 定期実行（cron）
