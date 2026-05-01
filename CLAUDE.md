# PostSynth — Claude Code 用プロジェクト指示書

> @k_grid_blog の技術発信コンテンツを Instagram + Threads へ全自動投稿する管理システム

このファイルは Claude Code が常に参照する、本プロジェクトの **コンテキストおよびコーディング規約** です。
新しい作業を開始する前に、必ず本ファイルと `docs/PostSynth-DESIGN-v3.md` を確認してください。

---

## あなたの役割

あなたは **シニアフルスタックエンジニア** として、本プロジェクトの開発を支援します。
以下の方針で開発を進めてください:

- Next.js 15 App Router のベストプラクティスに従う(Server Components 優先、必要箇所のみ Client Components)
- TypeScript の型安全性を最優先(`any` の使用は禁止、`unknown` で型ガード推奨)
- コンポーネントは再利用性・テスタビリティを考慮して設計する
- エラーハンドリングを明示的に実装する(Result型 or try/catch + 型付きエラー)
- 重要なロジックには JSDoc コメントを付ける(日本語OK)
- 外部依存(Claude API, Instagram, Threads, Supabase)はすべてラッパー経由でアクセス
- セキュリティ・コスト・運用容易性を意識する

---

## プロジェクト概要

| 項目 | 内容 |
|---|---|
| 名称 | PostSynth |
| 目的 | 「Promise.all について解説したい」というラフなアイデアから、Instagramカルーセル + Threads 投稿を完全自動生成・自動投稿する |
| 利用者 | Keigo(@k_grid_blog 運営者)1名 |
| 月額予算 | $0(Anthropic API のみ従量課金) |
| 設計書 | `docs/PostSynth-DESIGN-v3.md` |
| UIリファレンス | `docs/ui-reference/`(Claude Design 出力、最重要参照先) |

---

## 技術スタック

### フロントエンド
- **Next.js 15** (App Router)
- **TypeScript**(strict mode)
- **Tailwind CSS v4**(`@theme` ディレクティブで CSS変数連携)
- **shadcn/ui**(Button, Dialog, Tabs, Calendar, Tooltip, Popover などの基本部品)
- **lucide-react**(アイコン全般。IG/Threads のみ自前 SVG)
- **@dnd-kit/core + @dnd-kit/sortable**(レビュー画面のスライド並び替え)
- **react-hook-form + zod**(型安全フォーム)
- **TanStack Query**(Server state キャッシュ)
- **recharts**(投稿ログ・統計画面のグラフ)

### バックエンド・データ
- **Supabase**(Postgres + Storage + Auth、Free tier)
- **Vercel Hobby**(ホスティング、Cron 標準装備、無料)
- **Anthropic Claude API**(Sonnet モデル使用、コンテンツ生成)
- **Instagram Graph API v25.0**(カルーセル投稿)
- **Threads API v1.0**(テキスト投稿)

### 画像生成
- **satori**(Vercel製、JSX → SVG)
- **@resvg/resvg-js**(Rust製、SVG → PNG)
- **shiki**(VS Code 同等のシンタックスハイライト)

### テスト・品質
- **Vitest + React Testing Library + MSW**(単体・統合テスト)
- **Playwright**(任意の E2E テスト)
- **ESLint + Prettier**(Next.js 15 デフォルト + Tailwind プラグイン)

### 勝手に追加しないライブラリ
- 状態管理ライブラリ(Zustand, Jotai, Redux 等): TanStack Query + React state で十分
- CSS-in-JS(styled-components, emotion 等): Tailwind で統一
- ORM(Prisma, Drizzle 等): Supabase client を直接使用
- 別の HTTP クライアント(axios, ky 等): fetch + 自前ラッパーで統一
- 別のアイコンライブラリ(react-icons, heroicons 等): lucide-react に統一

---

## UIデザイン参照(最重要)

**管理画面(`/dashboard` 配下)の UI は `docs/ui-reference/` のリファレンス実装を一次ソースとする。**

このフォルダには Keigo さんが Claude Design で作成した完成イメージの React コードと CSS が配置されています。配色・余白・レイアウト・アニメーションをすべて忠実に再現してください。

### `docs/ui-reference/` の構成

```
docs/ui-reference/
├── index.html              ← ブラウザで開いて全画面確認可能
├── styles.css              ← 全 CSS(:root 変数含む、最重要)
├── shell.jsx               ← サイドバー・トップバー・ルーター
├── atoms.jsx               ← StatusBadge, PlatChip, PlatDot など共通コンポーネント
├── icons.jsx               ← I.* インラインSVGアイコン
├── data.js                 ← SEED_THEMES, SEED_SLIDES などのモックデータ
├── page_themes.jsx         ← /dashboard/themes 画面
├── page_review.jsx         ← /dashboard/review/[id] 画面
├── page_schedule.jsx       ← /dashboard/schedule 画面
├── page_logs.jsx           ← /dashboard/logs 画面
└── screenshots/            ← schedule.png, logs.png(視覚的な参考)
```

### UI実装の手順

新しい画面を実装する際は、以下を厳守してください:

1. **対応する `page_*.jsx` ファイルを読む**(該当画面のレイアウト・状態管理・分岐)
2. **`styles.css` の `:root` 変数を確認**(配色は既に `app/globals.css` に移植済み)
3. **配色・余白・角丸・影・フォントサイズは pixel-perfect で一致させる**
4. **レイアウト構造**(grid-template-columns, gap など)も完全一致
5. **アニメーション**(shimmer, spin, pulse)も再現する
6. **インタラクション**(hover, drag&drop, filter 切替)も再現する

### 変更してよい部分

- React コンポーネントの分割粒度(細かく分けてOK)
- インライン style → Tailwind class への置き換え(値が一致する前提で)
- アイコン: `I.*` → lucide-react の同等アイコンに置き換え(対応表は設計書 v3 参照)
- データ取得: `data.js` のモック → Supabase + Server Action
- ネイティブ `draggable` API → `@dnd-kit`(モバイル対応 & a11y のため)

### 削除すること

- `localStorage` での route 保持(`shell.jsx` 84-89行)→ Next.js URLベースルーティングに置き換え
- `window.SEED_*` グローバル変数の参照 → Server Action + Supabase に置き換え

### shadcn/ui の使い方

shadcn/ui の **デフォルトテーマは使わない**。`:root` 変数を Claude Design 由来のものに上書きしているため、shadcn コンポーネントの色も Claude Design に合わせて表示されます。

`Button` `Dialog` `Tabs` `Tooltip` `Calendar` `Popover` などの基本部品は積極的に使ってOK。ただし `Calendar`(react-day-picker)はスケジュール画面の月表示には使わず、自前実装(`page_schedule.jsx` 踏襲)を採用してください。

---

## ディレクトリ構成

```
postsynth/
├── docs/
│   ├── PostSynth-DESIGN-v3.md  # 設計書(必読)
│   ├── CLAUDE.md               # このファイル
│   └── ui-reference/           # Claude Design 出力(UI 一次ソース)
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── _components/        # サイドバー・トップバー
│   │   ├── themes/
│   │   │   ├── page.tsx
│   │   │   ├── _components/
│   │   │   └── _actions.ts     # Server Actions
│   │   ├── review/[id]/
│   │   │   ├── page.tsx
│   │   │   ├── _components/
│   │   │   └── _actions.ts
│   │   ├── schedule/
│   │   ├── logs/
│   │   └── settings/
│   ├── api/
│   │   ├── og/[type]/route.tsx # satori 画像生成
│   │   ├── cron/publish/route.ts
│   │   └── auth/meta/
│   ├── globals.css             # :root 変数 + Tailwind v4 @theme
│   └── layout.tsx
├── components/
│   ├── ui/                     # shadcn/ui 生成物
│   ├── shared/                 # 複数画面で再利用
│   └── icons/                  # IG/Threads カスタムSVG
├── lib/
│   ├── claude/                 # Anthropic SDK ラッパー + few-shot
│   ├── instagram/              # Instagram Graph API ラッパー
│   ├── threads/                # Threads API ラッパー
│   ├── images/                 # satori / shiki / hastToJsx
│   ├── supabase/               # client.ts, server.ts, service-role.ts
│   ├── types/                  # database.ts, content.ts
│   └── utils/
├── public/
│   └── fonts/                  # NotoSansJP, JetBrainsMono の subset
├── tests/
├── supabase/
│   └── migrations/
├── middleware.ts               # /dashboard/* 認証ガード
├── vercel.json                 # Cron 設定
└── package.json
```

### 命名規約

- ディレクトリ・ファイル名: **kebab-case**(例: `theme-card.tsx`)
- React コンポーネント名: **PascalCase**(例: `ThemeCard`)
- Server Action 関数: **camelCase + 動詞起点**(例: `createTheme`, `updateContent`)
- Route ファイル: Next.js 標準(`page.tsx`, `route.ts`, `layout.tsx`)
- `_components/` `_actions.ts` の **アンダースコア prefix** は Next.js のルート対象から除外する慣習

---

## Server Actions vs Route Handlers の使い分け

| 用途 | 採用 |
|---|---|
| フォーム送信・状態変更(認証済み画面内) | **Server Actions** |
| 外部からのコールバック(OAuth) | **Route Handlers** |
| 画像生成(`ImageResponse`) | **Route Handlers (`route.tsx`)** |
| Cron 起動エンドポイント | **Route Handlers** |
| 第三者からの Webhook 受信 | **Route Handlers** |
| クライアント側非同期データ取得 | **Server Actions(via TanStack Query)** |

### Server Action 実装ルール

- 必ずファイル冒頭に `'use server';`
- 引数は **プリミティブまたは zod でバリデート済み型**
- 戻り値は `{ success: true, data } | { success: false, error }` 型に統一
- 状態変更後は `revalidatePath()` または `revalidateTag()` を必ず呼ぶ
- DB 操作は `lib/supabase/server.ts` のクライアント経由

```ts
// 良い例
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  title: z.string().min(1).max(100),
  roughIdea: z.string().max(500),
});

export async function createTheme(input: z.infer<typeof schema>) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'バリデーションエラー' as const };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('post_themes')
    .insert(parsed.data)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/themes');
  return { success: true, data };
}
```

---

## コーディング規約

### TypeScript

- **`any` 禁止**。やむを得ず使う場合は `// eslint-disable-next-line` でコメント付きに
- 外部APIレスポンスは zod スキーマで必ず検証してから型を絞る
- discriminated union を活用(スライドタイプなど)
- `as` キャストは最小限に

### React / Next.js

- **デフォルトは Server Component**。`'use client'` は本当に必要な箇所のみ
- ループの `key` には `index` ではなく安定した ID を使う
- `useState` の初期値が重い計算なら `useState(() => init())` 形式
- Server Action からのデータは `useOptimistic` で楽観的更新する場面あり

### Tailwind CSS v4

- **クラス順は Prettier プラグインで自動整形**(layout → spacing → color → ...)
- `@apply` は使わない(Tailwind v4 では非推奨化の流れ)
- カスタム値は CSS変数経由(`bg-[var(--bg-1)]` ではなく Tailwind 設定で `bg-bg-1` を使えるようにする)

### Supabase

- ブラウザ用クライアント: `lib/supabase/client.ts`(Cookie ベース、SSRと整合)
- サーバー用クライアント: `lib/supabase/server.ts`(Server Component / Server Action用)
- Service Role 用: `lib/supabase/service-role.ts`(Cron / 管理操作のみ、絶対にクライアントへ漏らさない)
- 全テーブルで RLS を有効化、認証済みのみアクセス可

### エラーハンドリング

- 外部 API 呼び出しは `lib/utils/retry.ts` の指数バックオフリトライを必ず通す
- ユーザー向けエラーメッセージは日本語、ログは英語(検索性のため)
- 画像生成・投稿失敗時は `post_logs` テーブルに必ず記録

---

## 開発コマンド

```bash
# プロジェクト初期化(Next.js 15 を明示的に指定)
# ⚠️ @latest は Next.js 16 を入れてしまうため使わない
npx create-next-app@15 postsynth --typescript --tailwind --app --eslint --import-alias "@/*"

# 開発サーバー起動
npm run dev

# Supabase 型生成(マイグレーション後に必ず実行)
npx supabase gen types typescript --project-id <YOUR_PROJECT_ID> > lib/types/database.ts

# shadcn/ui コンポーネント追加
npx shadcn@latest add <component>

# テスト実行
npm run test           # Vitest watch モード
npm run test:run       # 1回だけ実行
npm run test:coverage  # カバレッジ出力

# Lint / Format
npm run lint
npm run format

# ビルド確認
npm run build
```

---

## 環境変数

`.env.local`(コミット禁止)に以下を設定:

```bash
# Anthropic
ANTHROPIC_API_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=         # サーバー専用、絶対にクライアントから参照しない

# Meta(Instagram + Threads)
META_APP_ID=
META_APP_SECRET=
META_REDIRECT_URI=https://postsynth.vercel.app/api/auth/meta/callback

# Cron 認証
CRON_SECRET=                       # Vercel Cron のヘッダー検証用

# サイトURL(OAuth リダイレクト用)
NEXT_PUBLIC_SITE_URL=https://postsynth.vercel.app
```

`.env.local.example` を repo にコミットしておき、新規環境構築時の参考にする。

---

## 禁止事項

以下は明示的に禁止します。Claude Code が誤って踏まないよう注意してください。

1. **`SUPABASE_SERVICE_ROLE_KEY` をクライアントから参照しない**
   - Server Action / Route Handler 内のみで使用
   - `NEXT_PUBLIC_*` プレフィックスを絶対に付けない
2. **API キー・トークンをハードコードしない**
   - 必ず環境変数経由
3. **`docs/ui-reference/` のファイルを直接編集しない**
   - リファレンス実装は読み取り専用
4. **`generated_contents.media_urls` を「公開アクセス不可」な状態で Instagram API に渡さない**
   - Supabase Storage の `generated-images` バケットは public 設定
5. **コンテンツ生成・画像生成・投稿のロジックを 1つの Server Action にまとめない**
   - Vercel Function 10秒制約に必ず引っかかる
   - 設計書 v3 の「画像生成の並列処理戦略」に従う
6. **shadcn/ui の `Calendar` コンポーネントをスケジュール画面の月表示に使わない**
   - 日セル内に複数アイテムを表示する複雑なレイアウトのため、`page_schedule.jsx` を踏襲した自前実装を使用
7. **`localStorage` をクライアントの永続データに使わない**(認証は Supabase Cookie、UI状態はURL Query)
8. **`create-next-app@latest` `next@latest` `react@latest` を使わない**
   - 本プロジェクトは **Next.js 15 系で固定**。`@latest` は Next.js 16 が入ってしまう
   - 初期化は `npx create-next-app@15 ...` でメジャーバージョン指定する
   - パッケージ追加時も `next@15` `react@19` のようにメジャーバージョン明示

---

## ハマりどころメモ

実装時に詰まりやすいポイントを事前に共有します。

### satori + shiki

- shiki が返す HAST は satori が直接描画できない → `lib/images/hast-to-jsx.ts` を経由
- satori は **flexbox のみ**(grid 不可)、`box-shadow` `transition` などは無視される
- 日本語フォントは subset 化必須(全量だと 5MB 超えで Function size制限に当たる)

### Instagram Graph API

- 画像 URL は **公開アクセス可** である必要(Supabase Storage は public バケットを使用)
- カルーセル投稿は **コンテナ作成 → 集約 → publish** の3ステップ
- `Error 9004`(コンテナ処理中)は 5秒間隔で最大5回リトライ

### Threads API

- テキスト 500文字以内、ハッシュタグ **1個のみ**(複数は無効)
- コンテナ作成 → publish の間に 30秒待機を推奨

### Vercel Hobby

- Function 実行時間 10秒上限 → 重い処理は分割
- Cron は無料枠で 1日1回までの実行が信頼できる範囲(本プロジェクトは日次運用で OK)
- 帯域 100GB/月 → 画像配信は Supabase Storage に任せる

### Next.js バージョン管理

- 本プロジェクトは **Next.js 15 系で固定**(MailCatch / 言語化アシストAI と揃える方針)
- `npx create-next-app@latest` は **Next.js 16** が入るので使わない
- 必ず `npx create-next-app@15 ...` のようにメジャーバージョン指定
- 既存プロジェクトに依存追加するときも `npm install next@15 react@19` のように明示
- Next.js 16 への移行は**全体方針として別途検討**するまで実施しない

---

## 参照ドキュメント

| ドキュメント | 内容 |
|---|---|
| `docs/PostSynth-DESIGN-v3.md` | 全体設計書(アーキテクチャ・DB設計・API仕様・フェーズ計画) |
| `docs/ui-reference/` | UI リファレンス実装(Claude Design 出力) |
| `docs/ui-reference/screenshots/` | 画面スクリーンショット(視覚的な参考) |

外部リンク:
- [Anthropic API - Messages](https://docs.claude.com/en/api/messages)
- [Instagram Graph API - Content Publishing](https://developers.facebook.com/docs/instagram-platform/content-publishing)
- [Threads API](https://developers.facebook.com/docs/threads)
- [satori](https://github.com/vercel/satori)
- [shiki](https://shiki.style/)
- [@dnd-kit](https://dndkit.com/)
- [Tailwind CSS v4](https://tailwindcss.com/docs/v4-beta)

---

## 作業前チェックリスト

新しい機能・画面を実装する前に、以下を確認してください:

- [ ] `docs/PostSynth-DESIGN-v3.md` の該当セクションを読んだ
- [ ] UI 実装の場合、`docs/ui-reference/` の対応する `.jsx` を読んだ
- [ ] Server Action / Route Handler の使い分けを確認した
- [ ] 環境変数の追加が必要なら `.env.local.example` も更新する
- [ ] DB スキーマ変更がある場合、マイグレーションファイルを作成する
- [ ] 新しいライブラリの追加が必要な場合、Keigo に確認する(勝手に追加しない)
