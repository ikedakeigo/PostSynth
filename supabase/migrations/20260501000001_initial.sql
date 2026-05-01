-- ============================================
-- 拡張機能（必要に応じて）
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
-- 投稿テーマ（Keigo が入れる起点）
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
  -- Supabase Storage の公開URL配列（Instagramカルーセル用）
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
  -- pgcrypto で暗号化を推奨（将来対応）
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
-- 投稿ログ（分析・デバッグ用）
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
-- v3 追加: 投稿時刻の重複防止（将来複数アカウント対応用）
-- ============================================
create unique index idx_unique_scheduled
  on generated_contents (platform, posted_at)
  where status = 'posted';

-- ============================================
-- RLS（Row Level Security）ポリシー
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

-- Service Role（Cron実行）からはRLSをバイパスする運用にするため、
-- 専用ポリシーは不要（service_role キーは RLS を自動でバイパス）
