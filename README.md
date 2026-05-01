# PostSynth

@k_grid_blog の技術発信コンテンツを Instagram + Threads へ全自動投稿する管理システム。

ラフなアイデア 1 行から、Instagram カルーセル（スライド画像 + キャプション + ハッシュタグ）と Threads 投稿を AI で自動生成し、スケジュール登録 → 日次 Cron で自動投稿まで行います。

## 技術スタック

- **Frontend**: Next.js 15 (App Router) / TypeScript / Tailwind CSS v4 / shadcn/ui
- **Backend**: Supabase (Postgres + Storage + Auth) / Vercel Hobby
- **AI**: Anthropic Claude API (コンテンツ生成)
- **画像生成**: satori + shiki + @resvg/resvg-js
- **SNS**: Instagram Graph API v25.0 / Threads API v1.0

## セットアップ

### 前提条件

- Node.js 22.x LTS
- npm 10.x 以上
- Supabase アカウント

### インストール

```bash
git clone <repository-url>
cd PostSynth
npm install
```

### 環境変数

`.env.local.example` をコピーして `.env.local` を作成し、値を設定してください。

```bash
cp .env.local.example .env.local
```

### 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 にアクセス。

## コマンド一覧

| コマンド                | 説明                              |
| ----------------------- | --------------------------------- |
| `npm run dev`           | 開発サーバー起動（Turbopack）     |
| `npm run build`         | プロダクションビルド              |
| `npm run start`         | プロダクションサーバー起動        |
| `npm run lint`          | ESLint 実行                       |
| `npm run format`        | Prettier で全ファイルフォーマット |
| `npm run format:check`  | フォーマットチェック（CI 用）     |
| `npm run test`          | Vitest watch モード               |
| `npm run test:run`      | テスト 1 回実行                   |
| `npm run test:coverage` | カバレッジ付きテスト              |

## ブランチ運用

| ブランチ    | 用途                                                   |
| ----------- | ------------------------------------------------------ |
| `main`      | 本番デプロイ用。develop からの PR のみ受け付け         |
| `develop`   | 開発統合ブランチ。feature ブランチからの PR を受け付け |
| `feature/*` | 機能開発用。develop から分岐し、develop に PR          |

## pre-commit フック

コミット時に自動で以下が実行されます（Husky + lint-staged）:

1. **lint-staged**: ステージされたファイルに ESLint --fix + Prettier --write
2. **vitest run**: 全テスト実行

## ドキュメント

| ファイル                         | 内容                                            |
| -------------------------------- | ----------------------------------------------- |
| `CLAUDE.md`                      | Claude Code 用プロジェクト指示書                |
| `docs/PostSynth-DESIGN-v3.md`    | 全体設計書（アーキテクチャ・DB 設計・API 仕様） |
| `docs/PostSynth-PHASE1-SETUP.md` | Phase 1 セットアップ手順書                      |
| `docs/ui-reference/`             | Claude Design 出力（UI リファレンス実装）       |
