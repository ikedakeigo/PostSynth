# PostSynth - SNS全自動投稿システム 設計書 v3

> @k_grid_blog の技術発信コンテンツを Instagram + Threads へ全自動投稿するシステム

**最終更新**: 2026-05-01
**バージョン**: v3 (Claude Design による UI 確定版)
**対象アカウント**: @k_grid_blog (技術発信)
**対象プラットフォーム**: Instagram (フィード・カルーセル), Threads
**予算**: 月$0(Anthropic API のみ従量課金)

---

## 📋 目次

1. [v2 からの変更点](#v2-からの変更点)
2. [UI実装方針](#ui実装方針) 🆕 **最重要**
3. [プロジェクト概要](#プロジェクト概要)
4. [システムアーキテクチャ](#システムアーキテクチャ)
5. [技術スタック](#技術スタック)
6. [ディレクトリ構成](#ディレクトリ構成)
7. [Server Actions vs Route Handlers の使い分け](#server-actions-vs-route-handlers-の使い分け)
8. [コンポーネント設計](#コンポーネント設計)
9. [画面別実装ガイド](#画面別実装ガイド) 🆕
10. [コンテンツ生成フロー](#コンテンツ生成フロー)
11. [画像生成パイプライン](#画像生成パイプライン)
12. [画像生成の並列処理戦略](#画像生成の並列処理戦略)
13. [`hastToJsx` ヘルパー仕様](#hasttojsx-ヘルパー仕様)
14. [Few-shot Examples の管理](#few-shot-examples-の管理)
15. [データベース設計](#データベース設計)
16. [API連携仕様](#api連携仕様)
17. [テスト戦略](#テスト戦略)
18. [実装フェーズ計画](#実装フェーズ計画)
19. [セキュリティ・運用](#セキュリティ運用)
20. [既知の制約と対応策](#既知の制約と対応策)

---

## v2 からの変更点

| セクション | v2 | v3 |
|---|---|---|
| **UI実装方針** | コンポーネント設計のみ | 🆕 **Claude Design 提供のUI を一次ソースとする方針を確立** |
| **画面別実装ガイド** | 概念のみ | 🆕 4画面それぞれの実装手順を具体化 |
| **デザインシステム** | shadcn/ui を想定 | 🆕 **Claude Design の CSS変数・色・余白を踏襲**(shadcn/ui 併用) |
| **スライドタイプ** | 5種類(cover/concept/code/summary/cta) | 🆕 **6種類**(cover/intro/code/compare/warning/cta) |
| **ステータス** | (v1から変更なし) | 🆕 6ステータス確定: `draft / generating / review / scheduled / posted / failed` |
| **画像背景** | 単色 + Tailwind | 🆕 **5種類のグラデーションプリセット**(grad-1 〜 grad-5) |

---

## UI実装方針

### 🎯 最重要: Claude Design 提供 UI を一次ソースとする

**Keigo さんが Claude Design で作成した PostSynth UI を、本プロジェクトの正式デザインソースとして採用する。**
本設計書のあらゆる UI 関連記述よりも、Claude Design 提供のリファレンス実装が優先される。

### リファレンス実装の所在

```
docs/ui-reference/         ← プロジェクトに同梱する Claude Design 出力
├── index.html             ← ブラウザで開いて全画面確認可能
├── styles.css             ← 全 CSS(:root 変数含む)
├── shell.jsx              ← サイドバー・トップバー・ルーター
├── atoms.jsx              ← StatusBadge, PlatChip, PlatDot, StripePlaceholder
├── icons.jsx              ← I.* インラインSVGアイコン
├── data.js                ← SEED_THEMES, SEED_SLIDES, SEED_CAPTION 等のモック
├── page_themes.jsx        ← /dashboard/themes 実装
├── page_review.jsx        ← /dashboard/review/[id] 実装
├── page_schedule.jsx      ← /dashboard/schedule 実装
├── page_logs.jsx          ← /dashboard/logs 実装
└── screenshots/
    ├── schedule.png
    └── logs.png
```

### Claude Code への指示テンプレート

UI を Next.js 15 / TypeScript / shadcn/ui ベースで再構築する際、Claude Code に以下の指示を出す:

```
# 指示テンプレート(画面別)

@docs/ui-reference/page_themes.jsx と @docs/ui-reference/styles.css を参照し、
これと同じ見た目・同じインタラクションを Next.js 15 App Router で再構築してください。

【厳守】
1. styles.css の :root CSS変数(--bg-0, --accent 等)はそのまま引き継ぐ
2. 配色・余白・角丸・影・フォントサイズは pixel-perfect で一致させる
3. レイアウト構造(grid-template-columns, gap 等)も完全一致
4. アニメーション(shimmer, spin, pulse)も再現
5. インタラクション(hover, drag&drop, filter切替)も再現

【変更してよい部分】
- React コンポーネントの分割粒度(細かく分けてOK)
- 状態管理(useState → useState のままでよいが TanStack Query も併用可)
- インラインstyle → Tailwind class への置き換え(`globals.css` で同等の値を使う前提で)
- アイコン: icons.jsx の I.* → lucide-react に置き換え可能(同等の意味のもの)
- データ取得: data.js のモック → Supabase + Server Action

【shadcn/ui の使い方】
- Button, Dialog, Tabs, Tooltip, Calendar, Popover などの基本部品は shadcn/ui を採用
- ただし shadcn/ui のデフォルトテーマは使わず、:root 変数を Claude Design 由来のものに上書き
```

### デザインシステム継承

`globals.css` の冒頭に Claude Design の `:root` 変数をそのまま貼り付ける:

```css
/* app/globals.css */
@import "tailwindcss";

:root {
  --bg-0: #07070B;
  --bg-1: #0C0C13;
  --bg-2: #12121C;
  --bg-3: #191926;
  --bg-4: #212131;
  --line: #23232F;
  --line-soft: #1C1C28;

  --text-1: #EDEDF5;
  --text-2: #A5A5B8;
  --text-3: #6E6E82;
  --text-4: #4A4A5A;

  --accent: #8B7CF6;
  --accent-2: #A78BFA;
  --accent-hover: #9B8CFF;
  --accent-soft: rgba(139,124,246,0.12);
  --accent-border: rgba(139,124,246,0.28);

  --purple: #B07CF6;
  --indigo: #6366F1;

  --success: #34D399;
  --warning: #F59E0B;
  --info: #60A5FA;
  --danger: #F87171;
  --rose: #FB7185;

  --ig: #E4668C;
  --th: #E4E4ED;

  --radius-sm: 6px;
  --radius: 10px;
  --radius-lg: 14px;

  --font-ui: 'Inter', -apple-system, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
}
```

Tailwind v4 の `@theme` ディレクティブで CSS 変数とリンクする:

```css
@theme {
  --color-bg-0: var(--bg-0);
  --color-bg-1: var(--bg-1);
  --color-accent: var(--accent);
  --color-accent-2: var(--accent-2);
  /* ... 他 */
  --font-sans: var(--font-ui);
  --font-mono: var(--font-mono);
}
```

これで Tailwind の `bg-bg-0`, `text-accent-2` 等のユーティリティが Claude Design 由来の色を指す。

### フォント

```tsx
// app/layout.tsx
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ui',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### アイコン置き換え方針

`icons.jsx` の `I.*` を `lucide-react` の同等アイコンに置き換える対応表:

| Claude Design | lucide-react |
|---|---|
| `I.Layers` | `Layers` |
| `I.Calendar` | `Calendar` |
| `I.Chart` | `BarChart3` |
| `I.Inbox` | `Inbox` |
| `I.Settings` | `Settings` |
| `I.Search` | `Search` |
| `I.Bell` | `Bell` |
| `I.Plus` | `Plus` |
| `I.Filter` | `Filter` |
| `I.More` | `MoreHorizontal` |
| `I.Edit` | `Pencil` |
| `I.Trash` | `Trash2` |
| `I.Refresh` | `RefreshCw` |
| `I.Eye` | `Eye` |
| `I.Download` | `Download` |
| `I.Sparkle` | `Sparkles` |
| `I.Wand` | `Wand2` |
| `I.Code` | `Code2` |
| `I.Image` | `Image` |
| `I.Hash` | `Hash` |
| `I.X` | `X` |
| `I.Check` | `Check` |
| `I.ChevronD/U/L/R` | `ChevronDown/Up/Left/Right` |
| `I.Drag` | `GripVertical` |
| `I.Clock` | `Clock` |
| `I.AlertTri` | `AlertTriangle` |
| `I.IG` | カスタムSVG(`icons.jsx` のSVGを `components/icons/instagram.tsx` として保持) |
| `I.Threads` | カスタムSVG(同上) |

`I.IG` と `I.Threads` は lucide に同等のものがないため、**`icons.jsx` の SVG path をそのまま React コンポーネント化**して保持する。

### コンポーネント実装ポリシー

| Claude Design 元 | Next.js 15 移植先 | 備考 |
|---|---|---|
| `shell.jsx` の `Sidebar` | `app/dashboard/_components/sidebar.tsx` | Server Component化(navはClient分離) |
| `shell.jsx` の `Topbar` | `app/dashboard/_components/topbar.tsx` | パンくずは Server Component で `params` から組み立て |
| `shell.jsx` の `App` | `app/dashboard/layout.tsx` | localStorage ルーティングは Next.js Routerに置き換え |
| `atoms.jsx` の `StatusBadge` | `components/shared/status-badge.tsx` | そのまま移植 |
| `atoms.jsx` の `PlatChip` `PlatDot` | `components/shared/platform-chip.tsx` | 統合してプロップで切替 |
| `atoms.jsx` の `StripePlaceholder` | `components/shared/stripe-placeholder.tsx` | そのまま移植 |
| `page_themes.jsx` の `ThemeCard` | `app/dashboard/themes/_components/theme-card.tsx` | |
| `page_themes.jsx` の `FilterTabs` | `components/shared/filter-tabs.tsx` | スケジュール画面でも再利用 |
| `page_review.jsx` の `SlideCanvas` | `components/shared/slide-canvas.tsx` | プレビュー & satori 共用 |
| `page_review.jsx` の `SlideThumb` | `app/dashboard/review/[id]/_components/slide-thumb.tsx` | |
| `page_review.jsx` の `SyntaxHighlight` | **shiki に置き換え** | Claude Design版は簡易ハイライト、本実装ではshikiを使用 |

### 移植時の注意点

1. **`window.SEED_*` のグローバル変数は使わない** — Server Actions + Supabase に置き換え
2. **`localStorage` で route 保持しているロジック**(`shell.jsx` 84-89行目)は **削除** — Next.js の URL ベースルーティングに置き換え
3. **`React.Fragment` をそのまま使ってOK** — `<>` で構わないが、`shell.jsx` 65行目の `key` 付き Fragment は重要なので残す
4. **`draggable` ネイティブAPI**(`page_review.jsx` のスライド並び替え)は `@dnd-kit` に置き換え推奨 — アクセシビリティとモバイル対応のため
5. **インラインstyle が大量にある** — Tailwind class への置き換えはやってもよいが、**急がなくてよい**。動作優先。最終的に整理する想定。
6. **アニメーション定義**(`page_review.jsx` 末尾の `@keyframes shimmer/spin`)は `globals.css` に移動

---

## プロジェクト概要

(v2 と同じため省略。v2 設計書を参照)

---

## システムアーキテクチャ

### 全体構成図

```
┌────────────────────────────────────────────────────────────┐
│  ユーザー(Keigo)                                          │
│    ↓ ラフアイデア入力                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js 15 App Router (Vercel Hobby・無料)         │  │
│  │                                                      │  │
│  │  【管理画面】(Claude Design 準拠)                  │  │
│  │   /dashboard/themes          テーマ一覧 + 新規作成  │  │
│  │   /dashboard/review/[id]     3ペインレビュー画面    │  │
│  │   /dashboard/schedule        月カレンダー + 日詳細  │  │
│  │   /dashboard/logs            投稿ログ + KPI統計     │  │
│  │   /dashboard/settings        OAuth・トークン管理     │  │
│  │                                                      │  │
│  │  【Server Actions】                                  │  │
│  │   createTheme, generateContent, regenerateSlide,    │  │
│  │   updateContent, uploadImages, scheduleContent      │  │
│  │                                                      │  │
│  │  【Route Handlers】                                  │  │
│  │   /api/og/[type]             satori: 画像生成       │  │
│  │   /api/cron/publish          Vercel Cron            │  │
│  │   /api/auth/[platform]       OAuth コールバック    │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓ ↑                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Supabase (Free tier)                                │  │
│  │   Postgres + Storage + Auth                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  外部API: Anthropic / Instagram / Threads            │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

(データフローは v2 と同じ)

---

## 技術スタック

(v2 と基本同じ)v3 で確定したライブラリのみ追記:

| カテゴリ | 技術 | 用途 |
|---|---|---|
| アイコン | **lucide-react** | I.* の置き換え(IG/Threads のみカスタム) |
| ドラッグ&ドロップ | **@dnd-kit/core + @dnd-kit/sortable** | review画面のスライド並び替え |
| カレンダー | **react-day-picker(shadcn/ui Calendar 経由)** | schedule画面の月表示 |
| Markdown(将来) | react-markdown + remark-gfm | キャプションプレビュー |
| グラフ | **recharts** | logs画面の統計グラフ(週次バー、エンゲージメントメトリクス) |
| シンタックスハイライト | **shiki** | コードスライド画像生成 + review画面のコードプレビュー |

---

## ディレクトリ構成

v2 をベースに、Claude Design リファレンスを `docs/ui-reference/` に配置する点を追記:

```
postsynth/
├── docs/
│   └── ui-reference/         🆕 Claude Design 出力一式
│       ├── index.html
│       ├── styles.css
│       ├── *.jsx
│       └── screenshots/
│
├── app/
│   ├── (auth)/
│   ├── dashboard/
│   │   ├── layout.tsx                # Sidebar + Topbar
│   │   ├── page.tsx                  # /dashboard → themes へリダイレクト
│   │   ├── _components/
│   │   │   ├── sidebar.tsx           🆕 shell.jsx の Sidebar 移植
│   │   │   └── topbar.tsx            🆕 shell.jsx の Topbar 移植
│   │   ├── themes/
│   │   │   ├── page.tsx
│   │   │   ├── _components/
│   │   │   │   ├── theme-card.tsx
│   │   │   │   ├── theme-create-form.tsx
│   │   │   │   └── filter-tabs.tsx   ← schedule 画面でも再利用
│   │   │   └── _actions.ts
│   │   ├── review/
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── _components/
│   │   │       │   ├── slide-thumb-list.tsx     # 左ペイン
│   │   │       │   ├── slide-editor.tsx         # 中央ペイン
│   │   │       │   ├── slide-canvas.tsx         # プレビュー描画
│   │   │       │   ├── caption-editor.tsx       # 右ペインIG
│   │   │       │   ├── threads-editor.tsx       # 右ペインThreads
│   │   │       │   └── review-bottom-bar.tsx    # 下部アクションバー
│   │   │       └── _actions.ts
│   │   ├── schedule/
│   │   │   ├── page.tsx
│   │   │   └── _components/
│   │   │       ├── month-calendar.tsx
│   │   │       ├── day-panel.tsx
│   │   │       └── view-switcher.tsx           # Month/Week/List
│   │   ├── logs/
│   │   │   ├── page.tsx
│   │   │   └── _components/
│   │   │       ├── kpi-cards.tsx
│   │   │       ├── platform-chart.tsx           # recharts
│   │   │       ├── engagement-card.tsx
│   │   │       └── log-table.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/
│   │   ├── og/[type]/route.tsx
│   │   ├── cron/publish/route.ts
│   │   └── auth/meta/route.ts
│   └── globals.css                   🆕 Claude Design の :root 変数を継承
│
├── components/
│   ├── ui/                           # shadcn/ui 生成物
│   ├── shared/
│   │   ├── status-badge.tsx          🆕 atoms.jsx 移植
│   │   ├── platform-chip.tsx         🆕 atoms.jsx 移植
│   │   ├── stripe-placeholder.tsx    🆕 atoms.jsx 移植
│   │   └── slide-canvas.tsx          🆕 review 共通プレビュー
│   └── icons/
│       ├── instagram.tsx             🆕 icons.jsx の IG SVG 移植
│       └── threads.tsx               🆕 icons.jsx の Threads SVG 移植
│
├── lib/                              (v2と同じ)
├── public/fonts/                     (v2と同じ)
├── tests/                            (v2と同じ)
└── ...
```

---

## Server Actions vs Route Handlers の使い分け

(v2 と同じため省略)

---

## コンポーネント設計

v2 では `/dashboard/review/[id]` のみ詳細化していたが、v3 では Claude Design に基づき全画面を整理。
詳細は次セクション「画面別実装ガイド」で扱う。

---

## 画面別実装ガイド

各画面の実装手順・参照ファイル・データフロー・実装上の注意を整理。

---

### 画面 1: `/dashboard/themes`(テーマ一覧)

**参照**: `docs/ui-reference/page_themes.jsx`

#### レイアウト構成

```
┌────────────────────────────────────────────────────┐
│ <PageHeader> "テーマ一覧" + [Export] [新規作成]    │
├────────────────────────────────────────────────────┤
│ <ThemeCreateForm>                                   │
│  ┌────────────────────────┬─────────────────────┐  │
│  │ テーマ入力 textarea     │ プラットフォーム    │  │
│  │                          │ チェックリスト      │  │
│  └────────────────────────┴─────────────────────┘  │
│  [スタイル選択 chips]            [AIで生成]        │
├────────────────────────────────────────────────────┤
│ <FilterTabs> all/draft/generating/review/...       │
├────────────────────────────────────────────────────┤
│ <ThemeCard grid> (auto-fill, minmax(340px, 1fr))   │
│  ┌──────┐ ┌──────┐ ┌──────┐                         │
│  │ Card │ │ Card │ │ Card │                         │
│  └──────┘ └──────┘ └──────┘                         │
└────────────────────────────────────────────────────┘
```

#### 実装手順

1. **page.tsx を Server Component として作成**
   - Supabase から `post_themes` を取得
   - `searchParams.filter` で絞り込み
   - 取得結果を `<ThemeCard>` のリストとして渡す

2. **`<ThemeCreateForm>` を Client Component で作成**
   - `useState` で `prompt` と `plats` を管理
   - 「AIで生成」ボタンクリックで Server Action `generateContent()` を発火
   - Server Action 完了後、`revalidatePath('/dashboard/themes')` で再描画
   - 生成中は status='generating' で カードに shimmer アニメーション(page_themes.jsx 203-209行)

3. **`<ThemeCard>` の `status` 別アクションボタン分岐**
   - `generating`: スピナー表示、disabled
   - `posted`: 「成績を見る」 + Eye
   - `failed`: 「再生成」 + 削除
   - その他: 「レビュー」 + 削除
   - `page_themes.jsx` 269-298行 の分岐を踏襲

4. **`<FilterTabs>` を再利用可能なコンポーネントに**
   - `app/dashboard/themes/_components/filter-tabs.tsx` で実装し、schedule画面でも同じものを使う
   - `page_themes.jsx` 147-181行のスタイルをそのまま移植

#### モック → 実データ変換マップ

| モック (data.js) | 実データ (Supabase) |
|---|---|
| `SEED_THEMES[].id` | `post_themes.id` |
| `SEED_THEMES[].title` | `post_themes.title` |
| `SEED_THEMES[].prompt` | `post_themes.rough_idea` |
| `SEED_THEMES[].status` | `post_themes.status` |
| `SEED_THEMES[].platforms` | `post_themes.target_platforms` |
| `SEED_THEMES[].createdAt` | `post_themes.created_at` |
| `SEED_THEMES[].slides` | `generated_contents.content.instagram.slides.length` をJOINで取得 |
| `SEED_THEMES[].engagement` | `post_logs` から集計(将来Phase 6) |
| `SEED_THEMES[].errorNote` | `generated_contents.error_message` |

---

### 画面 2: `/dashboard/review/[id]`(レビュー画面)

**参照**: `docs/ui-reference/page_review.jsx`

#### レイアウト構成

3ペイン構成(grid-template-columns: 260px 1fr 380px):

```
┌────────────────────────────────────────────────────┐
│ <SubHeader> [←戻る] テーマ名 [review] 保存済み...  │
├──────────┬──────────────────────────┬──────────────┤
│ 左ペイン  │ 中央ペイン                │ 右ペイン     │
│ slides   │ 選択中スライドの編集UI    │ Caption +    │
│ thumbs   │ プレビュー(360×360)     │ Hashtags +   │
│ + drag   │ + フォーム              │ Threads本文 │
│ &drop    │ + 背景色選択            │              │
│           │                          │              │
│           │                          │              │
├──────────┴──────────────────────────┴──────────────┤
│ <BottomBar> ✓本文 ✓キャプション ○画像 [画像生成][スケジュール] │
└────────────────────────────────────────────────────┘
```

#### スライド種別とフィールドの対応

`page_review.jsx` の `SlideCanvas` 内分岐から、6種類のスライドタイプを確認:

| type | 必須フィールド | 任意フィールド | 用途 |
|---|---|---|---|
| `cover` | title, bg | sub | 表紙 |
| `intro` | title, body, bg | - | 導入・概要説明 |
| `code` | title, code, bg | - | コード解説 |
| `compare` | title, body, bg | - | 比較表現(直列vs並列など) |
| `warning` | title, body, bg | - | 注意・落とし穴の説明 |
| `cta` | title, bg | sub | フォロー誘導 |

> ⚠️ **v2 から変更**: v2 設計書では「cover/concept/code/summary/cta」の5種類だったが、Claude Design では `intro / compare / warning` を分けて 6種類になっている。**v3 はこの 6種類を採用**。

#### 実装手順

1. **`page.tsx` を Server Component で作成**
   - `params.id` から `generated_contents` を取得
   - 初期データを Client Component に渡す

2. **3ペイン全体を Client Component(`<ReviewClient>`)としてラップ**
   - 状態管理:
     - `slides` (順序・内容)
     - `selectedId` (中央ペインで編集中のスライド)
     - `caption`, `hashtags`, `threadsText`
   - 各変更で **デバウンス500ms 後に Server Action `updateContent()` 発火**
   - `useOptimistic` で即時UI反映

3. **左ペイン: `<SlideThumbList>`**
   - `@dnd-kit/sortable` で並び替え
   - 各 thumb クリックで `setSelectedId`
   - `page_review.jsx` 100-134行 のスタイルを忠実に踏襲(opacity, border の動的変化)

4. **中央ペイン: `<SlideEditor>`**
   - `<SlideCanvas>` でリアルタイムプレビュー(360×360)
   - スライド種別ごとに動的フォーム表示
   - 背景色プリセット(grad-1〜grad-5)の選択UI
   - 「AIで書き直す」ボタン → Server Action `regenerateSlide()`

5. **右ペイン: タブ切替型**
   - Instagram タブ: `<CaptionEditor>` + `<HashtagEditor>`
   - Threads タブ: `<ThreadsEditor>`(500字制限の進捗バー付き)
   - 文字数カウンタの色が 450/500 で変わる(`page_review.jsx` 329行)

6. **下部 `<BottomBar>`**
   - 完了状態のチェックリスト(本文・キャプション・画像)
   - 「画像を生成」 → クライアント並列実行(後述の戦略を参照)
   - 「スケジュール登録」 → モーダル → Server Action `scheduleContent()`

#### 重要: `<SlideCanvas>` の二重利用

`<SlideCanvas>` は **review画面のリアルタイムプレビュー** と **satori による画像生成** で共通利用したい。
ただし satori は CSS の一部しか対応しないため、以下の方針で分離:

```
components/shared/slide-canvas/
├── slide-canvas.tsx         ← review画面用(全CSSサポート、HTML描画)
├── slide-canvas-satori.tsx  ← 画像生成用(satori互換のJSXのみ)
└── shared.ts                ← 両者で共通の型・グラデーション定義
```

両者で **見た目は完全一致** させる(背景・フォント・色)が、実装は分ける。CIで両方の見た目をスナップショット比較するテストを置く。

---

### 画面 3: `/dashboard/schedule`(スケジュール)

**参照**: `docs/ui-reference/page_schedule.jsx` + `screenshots/schedule.png`

#### レイアウト構成

```
┌────────────────────────────────────────────────────┐
│ <PageHeader> "スケジュール" [同期] [手動で予約]    │
├────────────────────────────────────────────────────┤
│ <FilterTabs all/scheduled/posted/failed>           │
│                            [Month][Week][List] 切替 │
├──────────────────────────────────┬─────────────────┤
│ <MonthCalendar>                   │ <DayPanel>      │
│  Sun Mon Tue Wed Thu Fri Sat      │ 選択日の予定    │
│  各セルに予定アイテム表示          │ 一覧            │
│                                    │ 各アイテムに    │
│                                    │ time/platform/  │
│                                    │ status表示      │
└──────────────────────────────────┴─────────────────┘
```

#### 実装手順

1. **`page.tsx` を Server Component で作成**
   - URL から `?date=2026-04-19` を読み取り、選択日を初期化
   - `generated_contents` から `status IN ('scheduled', 'posted', 'failed')` のデータを取得
   - 月単位でグループ化

2. **`<MonthCalendar>` を Client Component で作成**
   - **shadcn/ui の Calendar(react-day-picker)を使わず、page_schedule.jsx を踏襲した自前実装**を推奨
     - 理由: 日セル内に複数の予定アイテムを表示する複雑なレイアウトのため
   - 月送り: `monthOffset` で前月/翌月へ移動
   - 各日セル内に最大2-3件の予定をタイル表示、超過分は「+N more」

3. **`<DayPanel>`**
   - 選択日の予定を時系列でリスト表示
   - 各アイテム: time + platform chip + title + status badge
   - クリックで該当 theme の review 画面へジャンプ

4. **`<ViewSwitcher>` (Month/Week/List)**
   - 初期実装は **Month のみ**。Week/List は将来対応(Phase 6)
   - ボタンを置いておくが Week/List クリック時はトーストで「準備中」

#### モック → 実データ変換マップ

| モック (SEED_SCHEDULE) | 実データ |
|---|---|
| `date` | `generated_contents.posted_at::date` または `scheduled_at::date` |
| `items[].time` | 上記の時刻部分 |
| `items[].title` | JOIN: `post_themes.title` |
| `items[].platform` | `generated_contents.platform` |
| `items[].status` | `generated_contents.status` |

---

### 画面 4: `/dashboard/logs`(投稿ログ・統計)

**参照**: `docs/ui-reference/page_logs.jsx` + `screenshots/logs.png`

#### レイアウト構成

```
┌────────────────────────────────────────────────────┐
│ <PageHeader> "投稿ログ・統計" [7d][30d][90d][All] [CSV] │
├────────────────────────────────────────────────────┤
│ <KPICards>                                         │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │今月投稿│ │生成済み│ │スケジュール│ │ 失敗  │       │
│  │  13    │ │  21    │ │   7    │ │   1   │       │
│  │+4 vs先月│ │+8 今週 │ │次:19:00│ │-2 vs先月│       │
│  └────────┘ └────────┘ └────────┘ └────────┘       │
├────────────────────────────────────────────────────┤
│ <PlatformChart> <EngagementCard>                    │
│  プラットフォーム別投稿数  | エンゲージメント       │
│  (週次バーチャート)        |  Likes 487           │
│                              |  Saves  68           │
├────────────────────────────────────────────────────┤
│ <LogTable>                                          │
│  At | Theme | Platform | Status | Duration | Error │
└────────────────────────────────────────────────────┘
```

#### 実装手順

1. **`page.tsx` を Server Component で作成**
   - URL の `?range=30d` で期間絞り込み
   - `post_logs` から集計

2. **`<KPICards>` で 4つの主要指標を表示**
   - 今月投稿数、生成済み、スケジュール中、失敗
   - 前月比/前週比の差分計算

3. **`<PlatformChart>` を `recharts` で実装**
   - 週次の投稿数を Instagram(紫) / Threads(白)で積み上げ
   - SEED_STATS_BY_WEEK の構造を流用

4. **`<EngagementCard>`**
   - Likes / Saves / Replies の平均値
   - 各メトリクスに横棒グラフ
   - 将来的に Instagram Insights API から実データ取得

5. **`<LogTable>`**
   - SEED_LOGS の構造を踏襲
   - At / Theme / Platform / Status / Duration / Error 列
   - 失敗行は赤マーカー、エラー詳細をホバーで表示

#### モック → 実データ変換マップ

| モック (SEED_LOGS) | 実データ |
|---|---|
| `at` | `post_logs.created_at` |
| `theme` | JOIN: `post_themes.title` |
| `platform` | `post_logs.platform` |
| `status` | `post_logs.action` を status風に変換 |
| `dur` | 開始ログと完了ログの差分 |
| `err` | `post_logs.details.error` |

---

## コンテンツ生成フロー

(v2 と同じ。**ただし v3 ではスライドタイプを 6種類に拡張**)

### zod スキーマ更新(v3)

```ts
// lib/claude/schema.ts
import { z } from 'zod';

export const slideSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('cover'),
    title: z.string().max(40),
    sub: z.string().max(40).optional(),
    bg: z.enum(['grad-1', 'grad-2', 'grad-3', 'grad-4', 'grad-5']),
  }),
  z.object({
    type: z.literal('intro'),
    title: z.string().max(40),
    body: z.string().max(200),
    bg: z.enum(['grad-1', 'grad-2', 'grad-3', 'grad-4', 'grad-5']),
  }),
  z.object({
    type: z.literal('code'),
    title: z.string().max(30),
    code: z.string().max(500),
    language: z.string().default('javascript'),
    bg: z.enum(['grad-1', 'grad-2', 'grad-3', 'grad-4', 'grad-5']),
  }),
  z.object({
    type: z.literal('compare'),
    title: z.string().max(30),
    body: z.string().max(250),
    bg: z.enum(['grad-1', 'grad-2', 'grad-3', 'grad-4', 'grad-5']),
  }),
  z.object({
    type: z.literal('warning'),
    title: z.string().max(40),
    body: z.string().max(200),
    bg: z.enum(['grad-1', 'grad-2', 'grad-3', 'grad-4', 'grad-5']),
  }),
  z.object({
    type: z.literal('cta'),
    title: z.string().max(40),
    sub: z.string().max(40).optional(),
    bg: z.enum(['grad-1', 'grad-2', 'grad-3', 'grad-4', 'grad-5']),
  }),
]);

export const generatedContentSchema = z.object({
  instagram: z.object({
    slides: z.array(slideSchema).min(5).max(8),
    caption: z.string().max(2200),
    hashtags: z.array(z.string()).max(30),
  }),
  threads: z.object({
    text: z.string().max(500),
    hashtag: z.string(),
  }),
});

export type GeneratedContent = z.infer<typeof generatedContentSchema>;
```

---

## 画像生成パイプライン

(v2 と同じ。スライドタイプが 6 種類になったので Route Handler も 6本になる点のみ変更)

```
app/api/og/
├── cover/route.tsx
├── intro/route.tsx       🆕(旧 concept)
├── code/route.tsx
├── compare/route.tsx     🆕
├── warning/route.tsx     🆕
└── cta/route.tsx
```

(旧 `summary` は削除。`intro` `compare` `warning` を新設)

---

## 画像生成の並列処理戦略

(v2 と同じため省略)

---

## `hastToJsx` ヘルパー仕様

(v2 と同じため省略)

---

## Few-shot Examples の管理

(v2 と同じため省略)

---

## データベース設計

### テーブル構成

| テーブル | 役割 |
|---|---|
| `post_themes` | Keigo が入力する投稿テーマ(起点) |
| `generated_contents` | AI が生成した Instagram / Threads コンテンツ |
| `sns_credentials` | Instagram / Threads の OAuth トークン保存 |
| `post_logs` | 投稿実行ログ(分析・デバッグ用) |

### 完全な SQL(マイグレーション用)

以下を `supabase/migrations/20260501000001_initial.sql` として作成。

```sql
-- ============================================
-- 拡張機能(必要に応じて)
-- ============================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================
-- updated_at 自動更新トリガー関数
-- ============================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================
-- 投稿テーマ(Keigo が入れる起点)
-- ============================================
create table post_themes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  rough_idea text,
  target_platforms text[] not null default array['instagram', 'threads'],
  status text not null default 'draft',
  -- draft → generating → review → scheduled → posted → failed
  scheduled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint post_themes_status_check
    check (status in ('draft', 'generating', 'review', 'scheduled', 'posted', 'failed'))
);

create trigger trg_post_themes_updated_at
  before update on post_themes
  for each row execute function set_updated_at();

-- ============================================
-- プラットフォーム別の生成コンテンツ
-- ============================================
create table generated_contents (
  id uuid primary key default gen_random_uuid(),
  theme_id uuid not null references post_themes(id) on delete cascade,
  platform text not null,
  -- 'instagram_feed' | 'threads'
  content jsonb not null,
  -- Instagram: { slides: [...], caption, hashtags }
  -- Threads:   { text, hashtag }
  media_urls text[] default '{}',
  -- Supabase Storage の公開URL配列(Instagramカルーセル用)
  external_post_id text,
  -- 投稿後にAPIが返すID
  status text not null default 'pending',
  -- pending → ready → publishing → posted → failed
  error_message text,
  retry_count int default 0,
  posted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(theme_id, platform),
  constraint generated_contents_platform_check
    check (platform in ('instagram_feed', 'threads')),
  constraint generated_contents_status_check
    check (status in ('pending', 'ready', 'publishing', 'posted', 'failed'))
);

create trigger trg_generated_contents_updated_at
  before update on generated_contents
  for each row execute function set_updated_at();

-- ============================================
-- SNS認証トークン
-- ============================================
create table sns_credentials (
  id uuid primary key default gen_random_uuid(),
  platform text unique not null,
  -- 'instagram' | 'threads'
  access_token text not null,
  -- pgcrypto で暗号化を推奨(将来対応)
  refresh_token text,
  expires_at timestamptz,
  meta jsonb default '{}',
  -- { instagram_business_id, facebook_page_id, threads_user_id, ... }
  updated_at timestamptz default now(),

  constraint sns_credentials_platform_check
    check (platform in ('instagram', 'threads'))
);

create trigger trg_sns_credentials_updated_at
  before update on sns_credentials
  for each row execute function set_updated_at();

-- ============================================
-- 投稿ログ(分析・デバッグ用)
-- ============================================
create table post_logs (
  id uuid primary key default gen_random_uuid(),
  content_id uuid references generated_contents(id) on delete cascade,
  platform text not null,
  action text not null,
  -- 'generated' | 'image_created' | 'container_created' |
  -- 'published' | 'failed' | 'retried'
  details jsonb,
  created_at timestamptz default now()
);

-- ============================================
-- インデックス
-- ============================================
create index idx_themes_status on post_themes(status);
create index idx_themes_scheduled on post_themes(scheduled_at)
  where status = 'scheduled';
create index idx_themes_created on post_themes(created_at desc);

create index idx_contents_theme on generated_contents(theme_id);
create index idx_contents_status on generated_contents(status, created_at);
create index idx_contents_posted on generated_contents(posted_at desc)
  where status = 'posted';

create index idx_logs_content on post_logs(content_id, created_at desc);
create index idx_logs_action on post_logs(action, created_at desc);

-- ============================================
-- v3 追加: 投稿時刻の重複防止(将来複数アカウント対応用)
-- ============================================
create unique index idx_unique_scheduled
  on generated_contents (platform, posted_at)
  where status = 'posted';

-- ============================================
-- RLS(Row Level Security)ポリシー
-- ============================================
-- Keigo 一人運用だがベストプラクティスとして設定
alter table post_themes enable row level security;
alter table generated_contents enable row level security;
alter table sns_credentials enable row level security;
alter table post_logs enable row level security;

-- 認証済みユーザーのみアクセス可
create policy "Authenticated users can manage themes"
  on post_themes for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can manage contents"
  on generated_contents for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can manage credentials"
  on sns_credentials for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can read logs"
  on post_logs for select
  to authenticated
  using (true);

-- Service Role(Cron実行)からはRLSをバイパスする運用にするため、
-- 専用ポリシーは不要(service_role キーは RLS を自動でバイパス)
```

### Storage バケット

Supabase ダッシュボードまたは CLI で作成:

| 項目 | 値 |
|---|---|
| Bucket name | `generated-images` |
| Public | **Yes**(Instagram API から参照するため) |
| File size limit | 5MB |
| Allowed MIME types | `image/png`, `image/jpeg`, `image/webp` |

CLI で作成する場合:

```bash
npx supabase storage create generated-images --public
```

### 型生成

マイグレーション適用後、TypeScript の型を自動生成:

```bash
npx supabase gen types typescript --project-id <YOUR_PROJECT_ID> > lib/types/database.ts
```

---

## API連携仕様

(v2 と同じため省略)

---

## テスト戦略

(v2 と基本同じ)v3 で追加:

### UI 一致確認テスト

Claude Design リファレンスの見た目を保つため、以下のテストを置く:

1. **Visual Regression Test**(任意)
   - Playwright の `toHaveScreenshot()` で各画面のスクリーンショットを取得
   - `docs/ui-reference/screenshots/` の画像と比較
   - 差分閾値 5% 以内なら合格

2. **Storybook(任意・将来)**
   - `<StatusBadge>` `<PlatformChip>` `<ThemeCard>` 等の atom/molecule を Storybook 化
   - Claude Design 由来のスタイルが壊れていないことを確認

---

## 実装フェーズ計画

v2 から **Phase 4(管理画面)を Claude Design 移植中心に書き換え**。

### Phase 1: 基盤構築(1週間)

(v2 と同じ)

### Phase 2: 画像生成(1.5週間)

(v2 と同じ。ただしスライドタイプ 6種類に拡張)

### Phase 3: コンテンツ生成(3-5日)

(v2 と同じ)

### Phase 4: 管理画面(1.5週間に拡張)

**v3 では Claude Design 移植が中心となるため、タスクを再構成。**

#### Phase 4-A: 共通基盤(2-3日)

- [ ] `docs/ui-reference/` を repo に commit
- [ ] `app/globals.css` に `:root` 変数を移植 + Tailwind v4 `@theme` 連携
- [ ] `app/layout.tsx` に Inter / JetBrains Mono フォントロード
- [ ] `components/icons/instagram.tsx` `threads.tsx` 作成(SVG 移植)
- [ ] `components/shared/status-badge.tsx` `platform-chip.tsx` 作成
- [ ] `app/dashboard/layout.tsx` + `_components/sidebar.tsx` `topbar.tsx`(`shell.jsx` 移植)

#### Phase 4-B: 画面実装(各画面 2-3日)

- [ ] `/dashboard/themes`
  - [ ] page.tsx (Server Component)
  - [ ] _components/theme-card.tsx
  - [ ] _components/theme-create-form.tsx
  - [ ] _components/filter-tabs.tsx
  - [ ] _actions.ts
- [ ] `/dashboard/review/[id]`
  - [ ] page.tsx
  - [ ] _components/slide-thumb-list.tsx (dnd-kit)
  - [ ] _components/slide-editor.tsx
  - [ ] _components/slide-canvas.tsx (review版)
  - [ ] _components/caption-editor.tsx
  - [ ] _components/threads-editor.tsx
  - [ ] _components/review-bottom-bar.tsx
- [ ] `/dashboard/schedule`
  - [ ] page.tsx
  - [ ] _components/month-calendar.tsx
  - [ ] _components/day-panel.tsx
- [ ] `/dashboard/logs`
  - [ ] page.tsx
  - [ ] _components/kpi-cards.tsx
  - [ ] _components/platform-chart.tsx (recharts)
  - [ ] _components/engagement-card.tsx
  - [ ] _components/log-table.tsx
- [ ] `/dashboard/settings`
  - [ ] page.tsx (OAuth・トークン状態)

### Phase 5: 投稿実行(3-5日)

(v2 と同じ)

### Phase 6: 運用改善(継続)

(v2 と同じ)

#### 総期間目安(v3 改訂)

- v2: 4〜5週間
- **v3: 4.5〜5.5週間**(Claude Design 移植の精度を上げるため Phase 4 を 0.5週延長)

ただし、**Claude Code に Claude Design リファレンスを参照させてコード生成すれば大幅に短縮可能**。Keigo さんの慣れた CLAUDE.md ワークフローでフル活用する想定。

---

## セキュリティ・運用

### `CLAUDE.md` の記述例(v3)

`postsynth/CLAUDE.md` に以下を必ず含める:

```markdown
# PostSynth

@k_grid_blog 向けの SNS 全自動投稿システム。

## 技術スタック
- Next.js 15 (App Router) / TypeScript / Tailwind v4
- Supabase (Postgres + Storage + Auth)
- Anthropic Claude API
- satori + shiki(画像生成)
- @dnd-kit, recharts, shadcn/ui, lucide-react

## UI 実装の原則
**`docs/ui-reference/` に Claude Design 由来のリファレンス実装が配置されている。**
UIを実装・修正する際は、必ず該当画面の `.jsx` ファイルと `styles.css` を参照し、
配色・余白・レイアウト・アニメーションを忠実に再現すること。

新しい画面を実装する場合:
1. `docs/ui-reference/page_*.jsx` を参照
2. `docs/ui-reference/styles.css` の :root 変数を踏襲(`globals.css` に既に移植済み)
3. インラインstyle はTailwindクラスに置き換えてOK(値は一致させる)
4. アイコンは lucide-react に置き換え(IG/Threads のみ自前 SVG)
5. インタラクション(hover, drag&drop, アニメーション)も再現

## ディレクトリ規約
- `app/dashboard/{page}/_components/`: そのページ固有のコンポーネント
- `app/dashboard/{page}/_actions.ts`: そのページの Server Actions
- `components/shared/`: 複数画面で再利用するコンポーネント
- `lib/{domain}/`: ドメインごとに client / publish / auth / types を分割

## Server Action vs Route Handler
- フォーム送信・状態変更 → Server Action
- 画像生成(ImageResponse) → Route Handler
- OAuth コールバック → Route Handler
- Cron → Route Handler

## テスト
- Vitest + RTL + MSW
- 画像生成はスナップショットテスト
- 詳細は docs/PostSynth-DESIGN-v3.md の「テスト戦略」を参照
```

(他の項目は v2 と同じ)

---

## 既知の制約と対応策

(v2 と同じため省略)

---

## 次のステップ

v3 では Claude Design リファレンスがあるため、以下の順で着手することを推奨:

1. **Phase 1 着手** — Next.js 15 + Supabase プロジェクトのひな形
2. **Phase 4-A 共通基盤** — `:root` 変数移植 + Sidebar / Topbar 移植
   ↑ ここまで終われば「アプリの形」が見える状態になり、モチベーションが上がる
3. **Phase 4-B `/dashboard/themes`** — 一覧画面が動けば確実な前進感
4. **Phase 3 コンテンツ生成** — テーマ作成→AI生成のフローを通す
5. **Phase 2 画像生成** — `hastToJsx` の最小サンプルから着手
6. **残りの画面実装と Phase 5 投稿実行**

---

## 参考リンク

- [Claude Design](https://claude.ai/design)
- [satori 公式](https://github.com/vercel/satori)
- [shiki 公式](https://shiki.style/)
- [Instagram Graph API - Content Publishing](https://developers.facebook.com/docs/instagram-platform/content-publishing)
- [Threads API](https://developers.facebook.com/docs/threads)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [@dnd-kit](https://dndkit.com/)
- [Anthropic API - Messages](https://docs.claude.com/en/api/messages)
- [recharts](https://recharts.org/)
- [Tailwind CSS v4](https://tailwindcss.com/docs/v4-beta)
