# PostSynth — Phase 1 セットアップ手順書

> Next.js 15 + Supabase + 認証 + 管理画面UI骨組みまでを構築する手順

このファイルは **Phase 1 の作業を Claude Code に依頼する際の指示書** として使います。
このファイルをそのまま Claude Code に渡し、「この手順書に従ってセットアップしてください」と依頼すれば自動的に Phase 1 完了まで進められます。

---

## 前提条件

- Node.js 20.9 以上(推奨: 22.x 系の LTS)
- npm 10.x 以上
- Supabase アカウント作成済み
- Vercel アカウント作成済み(後で連携)
- Meta for Developers アプリは Phase 5 で作成するため今は不要

---

## やりたいこと

PostSynth(@k_grid_blog 向けの SNS 全自動投稿システム)の **Phase 1: 基盤構築** を実装してください。

このフェーズで完成させるもの:

- Next.js 15 App Router + TypeScript プロジェクト
- Supabase 接続(DB + Auth + Storage クライアント)
- データベースマイグレーション(4テーブル作成)
- 認証保護(`/dashboard/*` は Supabase Auth でガード)
- 管理画面 UI の骨組み(サイドバー + トップバー + 各画面の空ページ)
- `docs/ui-reference/` の Claude Design リファレンスに沿った見た目の再現

このフェーズで **やらないこと**(Phase 2 以降):

- Claude API でのコンテンツ生成
- satori / shiki での画像生成
- Instagram / Threads API での投稿実行
- Meta for Developers アプリ作成・OAuth フロー

---

## 添付資料(必読)

Claude Code はまず以下を読んでから作業を開始してください:

- `docs/PostSynth-DESIGN-v3.md` — 全体設計書
- `docs/CLAUDE.md` — コーディング規約・技術スタック・禁止事項
- `docs/ui-reference/` — UI リファレンス実装(Claude Design 出力)
  - `styles.css` — 必ず最初に読む(`:root` 変数、デザインシステム)
  - `shell.jsx` — サイドバー・トップバー実装
  - `page_themes.jsx` — テーマ一覧画面の骨格
  - 他

---

## 手順

### 1. プロジェクト初期化

```bash
# Next.js 15 を明示指定(@latest は Next.js 16 を入れてしまうので使わない)
npx create-next-app@15 postsynth \
  --typescript \
  --tailwind \
  --app \
  --eslint \
  --import-alias "@/*"

cd postsynth
```

プロンプト対応:

- `Would you like to use src/ directory?` → **No**(`app/` をルート直下に配置)
- `Would you like to use Turbopack for next dev?` → **Yes**(高速)

### 2. ドキュメント・リファレンスの配置

```bash
# ドキュメントディレクトリ作成
mkdir -p docs

# 設計書と CLAUDE.md を配置
cp ~/Downloads/PostSynth-DESIGN-v3.md docs/
cp ~/Downloads/CLAUDE.md ./           # ⚠️ ルート直下に配置(Claude Code が自動検出)

# UI リファレンスを展開
unzip ~/Downloads/PostSynth.zip -d docs/ui-reference

# 確認
ls -la docs/
ls -la docs/ui-reference/
ls CLAUDE.md
```

### 3. 依存パッケージの追加

```bash
# Supabase
npm install @supabase/supabase-js @supabase/ssr

# UI 関連
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# フォーム・バリデーション
npm install react-hook-form zod @hookform/resolvers

# Server state
npm install @tanstack/react-query @tanstack/react-query-devtools

# グラフ(logs画面用)
npm install recharts

# テスト
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom msw
```

### 4. shadcn/ui 初期化

```bash
npx shadcn@latest init
```

プロンプト対応:

- `Which style would you like to use?` → **Default**
- `Which color would you like to use as base color?` → **Slate**(後で `:root` 変数で上書きするのでなんでもOK)
- `Where is your global CSS file?` → `app/globals.css`
- `Do you want to use CSS variables for colors?` → **Yes**
- `Where is your tailwind.config?` → デフォルト
- `Configure import alias for components?` → `@/components`
- `Configure import alias for utils?` → `@/lib/utils`

その後、必要なコンポーネントを追加:

```bash
npx shadcn@latest add button dialog tabs tooltip popover dropdown-menu input textarea label select card badge sonner
```

### 5. `app/globals.css` を Claude Design 由来の `:root` 変数で上書き

`docs/ui-reference/styles.css` の `:root` ブロックを `app/globals.css` の冒頭に移植します。

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

@theme {
  --color-bg-0: var(--bg-0);
  --color-bg-1: var(--bg-1);
  --color-bg-2: var(--bg-2);
  --color-bg-3: var(--bg-3);
  --color-bg-4: var(--bg-4);
  --color-line: var(--line);
  --color-line-soft: var(--line-soft);

  --color-text-1: var(--text-1);
  --color-text-2: var(--text-2);
  --color-text-3: var(--text-3);
  --color-text-4: var(--text-4);

  --color-accent: var(--accent);
  --color-accent-2: var(--accent-2);
  --color-accent-hover: var(--accent-hover);

  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-danger: var(--danger);
  --color-info: var(--info);

  --font-sans: var(--font-ui);
  --font-mono: var(--font-mono);
}

body {
  background: var(--bg-0);
  color: var(--text-1);
  font-family: var(--font-ui);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  letter-spacing: -0.005em;
}

/* docs/ui-reference/styles.css のスクロールバー設定もここに移植 */
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #2A2A3A; border-radius: 10px; border: 2px solid var(--bg-1); }
::-webkit-scrollbar-thumb:hover { background: #3A3A4A; }

/* アニメーション定義(docs/ui-reference/page_review.jsx 末尾より) */
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
```

### 6. フォント読み込み

`app/layout.tsx` を更新:

```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PostSynth",
  description: "@k_grid_blog 向けSNS全自動投稿システム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### 7. Supabase クライアント実装

#### `lib/supabase/client.ts`(ブラウザ用)

```ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

#### `lib/supabase/server.ts`(Server Component / Server Action 用)

```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component から呼ばれた場合、Cookie 設定はできないので無視
          }
        },
      },
    },
  );
}
```

#### `lib/supabase/service-role.ts`(Cron / 管理操作用)

```ts
import { createClient } from '@supabase/supabase-js';

/**
 * Service Role キーを使うクライアント。RLS をバイパスする。
 * Cron や管理操作でのみ使用、絶対にブラウザに渡さないこと。
 */
export function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
```

#### `middleware.ts`(`/dashboard/*` 認証保護)

```ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // /dashboard/* は認証必須
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // ログイン済みでログイン画面に来たらダッシュボードへ
  if (request.nextUrl.pathname === '/login' && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard/themes';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

### 8. データベースマイグレーション

`supabase/migrations/20260501000001_initial.sql` を作成。
**設計書 v3 の「データベース設計」セクションの SQL をそのまま貼り付け、RLS ポリシーも含める**。

(SQL の中身は `docs/PostSynth-DESIGN-v3.md` の該当セクションを参照。ここでは省略)

実行手順:

```bash
# Supabase CLI インストール(まだなら)
npm install -D supabase

# プロジェクトリンク
npx supabase login
npx supabase link --project-ref <YOUR_PROJECT_REF>

# マイグレーション適用
npx supabase db push

# 型生成
npx supabase gen types typescript --project-id <YOUR_PROJECT_ID> > lib/types/database.ts
```

### 9. Storage バケット作成

Supabase ダッシュボードまたは CLI で:

- バケット名: `generated-images`
- Public: **Yes**(Instagram API から参照するため)
- File size limit: 5MB
- Allowed MIME types: `image/png, image/jpeg, image/webp`

### 10. 管理画面の骨組み実装

`docs/ui-reference/shell.jsx` と `page_themes.jsx` を参照しつつ、以下を実装:

- `app/dashboard/layout.tsx` — サイドバー + トップバー
- `app/dashboard/_components/sidebar.tsx` — `shell.jsx` の `Sidebar` 移植
- `app/dashboard/_components/topbar.tsx` — `shell.jsx` の `Topbar` 移植
- `app/dashboard/page.tsx` — `/dashboard/themes` へリダイレクト
- `app/dashboard/themes/page.tsx` — テーマ一覧(空のリスト + 新規作成フォームのガワ)
- `app/dashboard/review/[id]/page.tsx` — 「準備中」プレースホルダ
- `app/dashboard/schedule/page.tsx` — 「準備中」プレースホルダ
- `app/dashboard/logs/page.tsx` — 「準備中」プレースホルダ
- `app/dashboard/settings/page.tsx` — 「準備中」プレースホルダ
- `app/(auth)/login/page.tsx` — Supabase Auth のログインフォーム

#### 共通コンポーネント

- `components/shared/status-badge.tsx` — `atoms.jsx` の `StatusBadge` 移植
- `components/shared/platform-chip.tsx` — `atoms.jsx` の `PlatChip` 移植
- `components/icons/instagram.tsx` — `icons.jsx` の IG SVG を React 化
- `components/icons/threads.tsx` — `icons.jsx` の Threads SVG を React 化

### 11. `.env.local.example` 作成

```bash
# Anthropic(Phase 3 から使用)
ANTHROPIC_API_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Meta(Phase 5 から使用、今は空でOK)
META_APP_ID=
META_APP_SECRET=
META_REDIRECT_URI=https://postsynth.vercel.app/api/auth/meta/callback

# Cron 認証(Phase 5 から使用)
CRON_SECRET=

# サイトURL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`.gitignore` に `.env.local` を追加(create-next-app が既に追加しているはず、要確認)。

### 12. 動作確認

```bash
# 開発サーバー起動
npm run dev
```

確認項目:

- [ ] `http://localhost:3000` にアクセスすると `/dashboard/themes` にリダイレクトされる
- [ ] 未ログインなら `/login` にリダイレクトされる
- [ ] サイドバーの Claude Design の見た目になっている(配色・余白)
- [ ] テーマ一覧画面に新規作成フォームのガワが表示される
- [ ] ESLint エラーなし(`npm run lint`)
- [ ] ビルド成功(`npm run build`)

---

## 完了の定義(Definition of Done)

以下を全て満たした状態で Phase 1 完了とします:

1. ✅ Next.js 15 プロジェクトが起動する
2. ✅ Supabase にログイン・ログアウトできる
3. ✅ `/dashboard/*` が認証保護されている
4. ✅ Supabase の 4テーブル(`post_themes`, `generated_contents`, `sns_credentials`, `post_logs`)が作成済み
5. ✅ Storage バケット `generated-images` が public 設定で作成済み
6. ✅ サイドバー・トップバーが Claude Design の見た目で表示される
7. ✅ `/dashboard/themes` にアクセスすると、テーマ一覧画面のガワが表示される(データはまだ空)
8. ✅ `lib/types/database.ts` に Supabase の型定義が生成されている
9. ✅ `npm run lint` `npm run build` が成功する

---

## トラブルシューティング

### `Type error: Cannot find module '@/lib/supabase/server'`

→ `tsconfig.json` の `paths` 設定を確認。`create-next-app` のデフォルトで `"@/*": ["./*"]` が設定されているはず。

### Tailwind v4 の `@theme` ディレクティブが効かない

→ Tailwind CSS v4 はまだβ的な扱いなので、エラーが出たら一旦 `globals.css` で CSS変数のみ定義し、Tailwind のクラスは `bg-[var(--bg-0)]` のように直接書く方式にフォールバック。

### Supabase Auth でログインできない

→ Supabase ダッシュボードで Email Auth が有効になっているか確認。確認メールが届かない場合は SMTP 設定または開発環境の自動確認設定を確認。

### `next/font` のフォントが読み込まれない

→ `app/layout.tsx` の `<html>` タグに `className={inter.variable}` が付いているか確認。子コンポーネントで `var(--font-ui)` が使えるはず。

---

## 完了後の次のステップ

Phase 1 完了したら:

1. リポジトリを GitHub に push
2. Vercel に連携(自動デプロイ設定)
3. 本番環境変数を Vercel に設定
4. **Phase 2(画像生成パイプライン)** に進む
   - 別途 Phase 2 用の手順書を Keigo に依頼

---

## メモ

- **Next.js 15 で固定** している。`@latest` は使わず `@15` を必ず指定すること(設計書 v3 の方針)
- 既存プロジェクト(MailCatch / 言語化アシストAI)とバージョン揃えるため
- Next.js 16 への移行は別途検討タイミングで実施
