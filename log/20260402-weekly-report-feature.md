# 週報形式レポート機能の実装記録

作成日: 2026-04-02

## 概要

Googleカレンダーのイベントから、社内共有用の週報形式レポートを生成する機能を実装した。

## 背景・課題

既存の実装では以下の問題があった：

| データ | 取得 | レポートに反映 |
|--------|------|---------------|
| 参加者 (attendees) | ✅ | ⚠️ 集計のみ（誰と何回会ったか） |
| 説明 (description) | ✅ | ❌ 未使用 |
| イベントタイトル | ✅ | ⚠️ タイトル一覧のみ |

**問題点**: 「誰と・何について・どんな内容の」会議をしたかの詳細がレポートに反映されず、週報として社内共有するには情報が不足していた。

## 実装内容

### 1. 型定義の拡張 (`src/report/types.ts`)

```typescript
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
```

- `EventDetail` 型を追加し、イベントごとの詳細情報を保持
- `ReportType` に `'weekly'` を追加

### 2. データ変換の強化 (`src/calendar/transform.ts`)

```typescript
function extractEventDetail(event: CalendarEvent): EventDetail
```

- `extractEventDetail` 関数を追加
- イベントごとに参加者名、説明文、場所などを抽出
- `DailyEvents` に `eventDetails` フィールドを追加

### 3. 週報形式プロンプトの追加 (`src/report/generate.ts`)

```typescript
function buildWeeklyPrompt(options: GenerateOptions): string
```

- 週報に特化した新しいプロンプトを追加
- イベントの説明文をClaudeに渡し、内容を要約させる
- 出力形式を社内共有に適した構造に設計

### 4. モックデータの充実 (`src/calendar/mock.ts`)

```typescript
interface MockEventTemplate {
  title: string
  descriptions: string[]
}
```

- 各イベントテンプレートに複数の説明文パターンを追加
- より現実的なテストデータを生成

### 5. 設定変更 (`src/lib/config.ts`)

- デフォルトのレポートタイプを `'weekly'` に変更
- 環境変数 `REPORT_TYPE` でのカスタマイズをサポート

## 出力フォーマット

```markdown
# 週次活動レポート

## 今週のサマリー
- 会議数: 29件（総時間: 29.5時間）
- 主な協業先: 田中太郎（29件）、鈴木花子（24件）...
- 主要な活動トピック:
  - クライアントX社との契約更新交渉
  - 認証機能の技術レビュー
  ...

## 日別活動詳細

### 3月26日（木）- 6時間11分

- **プロジェクトA 進捗確認** 10:00-11:00
  - 参加者: 田中太郎, 鈴木花子
  - 内容: フェーズ2の進捗確認とリリース日程調整
  - 決定事項: 4/5にβ版リリース予定

## 今週の主要トピック
...
```

## 使用方法

```bash
# 週報形式（デフォルト）
npx tsx src/index.ts

# モックデータでテスト
npx tsx src/index.ts --mock

# 明示的にタイプ指定
npx tsx src/index.ts --type weekly
```

## PR

- https://github.com/masa-san-jp/gws-cal-to-report/pull/1

## 今後の課題

- [ ] 実際のカレンダーデータでの動作確認
- [ ] レポートの出力形式のさらなるカスタマイズ
- [ ] 複数カレンダーの統合サポート
