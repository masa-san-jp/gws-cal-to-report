# Google Calendar Weekly Report Generator

Googleカレンダーから1週間分のイベントを取得し、Claude APIを使って週次活動レポートを自動生成するCLIツール。

## 特徴

- **カレンダーイベントの自動取得**: gws CLIを使用してGoogle Calendarからイベントを取得
- **詳細な活動レポート**: 参加者、説明文、会議内容を含む週報形式のレポートを生成
- **複数のレポート形式**: summary / detailed / business / weekly から選択可能
- **Claude AI による分析**: イベントデータを分析し、ビジネスインサイトを含むレポートを生成

## 必要要件

- Node.js >= 20.x
- [gws CLI](https://github.com/googleworkspace/cli) (Google Workspace CLI)
- Anthropic API Key

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env` を作成:

```bash
cp .env.example .env
```

`.env` ファイルを編集:

```bash
ANTHROPIC_API_KEY=sk-ant-...   # 必須: Anthropic API Key
CALENDAR_ID=primary             # オプション: カレンダーID（デフォルト: primary）
REPORT_OUTPUT_DIR=./output      # オプション: 出力ディレクトリ
REPORT_TYPE=weekly              # オプション: レポートタイプ
```

### 3. Google Calendar認証

gws CLIをインストールし、認証を行う:

```bash
npm install -g @googleworkspace/cli
gws auth login -s calendar
```

## 使用方法

### 基本的な使い方

```bash
# 過去7日間のレポートを生成
npx tsx src/index.ts

# モックデータでテスト
npx tsx src/index.ts --mock
```

### オプション

```bash
# 期間を指定
npx tsx src/index.ts --start 2026-03-01 --end 2026-03-07

# レポートタイプを指定
npx tsx src/index.ts --type weekly    # 週報形式（デフォルト）
npx tsx src/index.ts --type business  # ビジネスインサイト付き
npx tsx src/index.ts --type detailed  # 詳細分析
npx tsx src/index.ts --type summary   # 簡潔なサマリー
```

## レポート形式

### weekly（デフォルト）

社内共有用の週報形式。日別の活動詳細と参加者情報を含む。

```markdown
# 週次活動レポート

## 今週のサマリー
- 会議数: 29件（総時間: 29.5時間）
- 主な協業先: 田中太郎（29件）、鈴木花子（24件）...

## 日別活動詳細

### 3月26日（木）- 6時間11分

- **プロジェクトA 進捗確認** 10:00-11:00
  - 参加者: 田中太郎, 鈴木花子
  - 内容: フェーズ2の進捗確認とリリース日程調整
  - 決定事項: 4/5にβ版リリース予定
```

### business

ビジネスインサイトを含む詳細レポート。時間配分の分析や改善提案を含む。

### detailed

日別の詳細分析、会議テーマの分類、参加者分析を含む。

### summary

簡潔なサマリーレポート。総会議数、傾向、主要な参加者のみ。

## プロジェクト構成

```
src/
├── index.ts              # エントリポイント
├── calendar/
│   ├── fetch.ts          # gws CLI呼び出し
│   ├── transform.ts      # データ整形
│   ├── mock.ts           # モックデータ生成
│   └── types.ts          # 型定義
├── report/
│   ├── generate.ts       # レポート生成
│   └── types.ts          # 型定義
└── lib/
    ├── claude.ts         # Claude API クライアント
    └── config.ts         # 設定管理
```

## 開発

### TypeScript型チェック

```bash
npx tsc --noEmit
```

### モックデータでテスト

```bash
npx tsx src/index.ts --mock
```

## ライセンス

MIT

## 関連ドキュメント

- [設計仕様書](log/20260319-calendar-report-spec.md)
- [開発ログ](log/20260402-weekly-report-feature.md)
