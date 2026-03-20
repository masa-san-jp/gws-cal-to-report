# Googleカレンダー週次レポート生成 設計コンセプト

作成日: 2026-03-19
参照: docs/ghcopilot-design-specific.md (UC-01), docs/claude-gws-log-extraction-design.md

## 目的

1週間分のGoogleカレンダーイベントを取得し、活動レポートを自動生成する。

## アーキテクチャ

```
[gws CLI] → [JSON取得] → [データ整形] → [LLM分析] → [レポート出力]
```

## 技術スタック

- **データ取得**: gws CLI (`@googleworkspace/cli`)
- **処理言語**: TypeScript (Node.js)
- **LLM**: Claude API (トークンコスト最小化のためHaiku優先)　→ sonnet4.6を使う
- **出力形式**: Markdown

## 主要コンポーネント

### 1. カレンダーデータ取得 (`src/calendar/fetch.ts`)

```bash
gws calendar events list \
  --params '{"calendarId":"primary","timeMin":"...","timeMax":"...","singleEvents":true,"orderBy":"startTime"}'
```

取得フィールド:
- summary, description, start, end
- attendees, organizer
- location, recurrence

### 2. データ整形 (`src/calendar/transform.ts`)

- 日別グループ化
- 会議時間計算
- 参加者集計
- 定例/単発の分類

### 3. レポート生成 (`src/report/generate.ts`)

出力項目:
- 日別会議件数・時間
- テーマ別分類
- 参加者頻度
- 定例会議比率
- ビジネスレポート

## トークンコスト最小化戦略

1. **前処理で圧縮**: 生JSONをLLMに渡さず、集計済みデータのみ
2. **Haikuモデル使用**: 分類・要約タスクはHaikuで十分
3. **バッチ処理**: 1回のAPI呼び出しで全イベント処理

## ファイル構成（予定）

```
src/
  calendar/
    fetch.ts      # gws CLI呼び出し
    transform.ts  # データ整形
  report/
    generate.ts   # レポート生成
    templates.ts  # 出力テンプレート
  index.ts        # エントリポイント
```

## 実行方法

```bash
# 1. .envファイルを作成
cp .env.example .env
# .envを編集してANTHROPIC_API_KEYを設定

# 2. モックデータでテスト
npm run dev -- --mock

# 3. 実データで実行（gws CLI認証済みの場合）
npm run dev
```

## 留意事項

- カレンダーは「予定」であり「実績」ではない
- 非公開予定の扱いに配慮
- OAuth認証が必要（初回のみ対話的）
