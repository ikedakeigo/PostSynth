// Seed data for the prototype
window.SEED_THEMES = [
  {
    id: 'th_001',
    title: 'Promise.allについて解説したい',
    prompt: 'Promise.allの使い方と並列実行のパフォーマンスメリットをJSエンジニア向けに解説',
    status: 'review',
    platforms: ['instagram', 'threads'],
    createdAt: '2026-04-17 09:12',
    slides: 7,
    author: 'AI Generator',
  },
  {
    id: 'th_002',
    title: 'TypeScriptのsatisfies演算子入門',
    prompt: '4.9で追加されたsatisfiesの使い所を、constアサーションと比較しながら紹介',
    status: 'scheduled',
    platforms: ['instagram', 'threads'],
    createdAt: '2026-04-16 22:40',
    scheduledAt: '2026-04-19 19:00',
    slides: 6,
    author: 'AI Generator',
  },
  {
    id: 'th_003',
    title: 'React Server Componentsの誤解3つ',
    prompt: 'RSCに関してよくある勘違いを整理し、正しい使い方を短く解説',
    status: 'generating',
    platforms: ['instagram'],
    createdAt: '2026-04-18 08:02',
    slides: null,
    author: 'AI Generator',
  },
  {
    id: 'th_004',
    title: 'CSS Cascade Layersで秩序を取り戻す',
    prompt: '@layer を使ってスタイル優先度を設計する例',
    status: 'posted',
    platforms: ['instagram', 'threads'],
    createdAt: '2026-04-14 11:21',
    postedAt: '2026-04-15 19:00',
    slides: 8,
    engagement: { likes: 412, saves: 58, replies: 22 },
    author: 'AI Generator',
  },
  {
    id: 'th_005',
    title: 'Bun 1.2で何が変わった？',
    prompt: 'Bun 1.2の主要機能アップデートを紹介',
    status: 'draft',
    platforms: ['threads'],
    createdAt: '2026-04-18 07:48',
    slides: null,
    author: 'Draft',
  },
  {
    id: 'th_006',
    title: 'useOptimisticフックの実践例',
    prompt: 'Reactのエクスペリメンタルな useOptimistic の実践的な使い方',
    status: 'failed',
    platforms: ['instagram'],
    createdAt: '2026-04-13 18:05',
    slides: 5,
    errorNote: '画像生成APIタイムアウト',
    author: 'AI Generator',
  },
  {
    id: 'th_007',
    title: 'Zodで型安全なフォーム',
    prompt: 'Zod + react-hook-form で実装するバリデーション戦略',
    status: 'scheduled',
    platforms: ['instagram'],
    createdAt: '2026-04-12 14:30',
    scheduledAt: '2026-04-21 12:00',
    slides: 6,
    author: 'AI Generator',
  },
  {
    id: 'th_008',
    title: 'Node.jsのワーカースレッド実践',
    prompt: 'CPU負荷の高い処理をworker_threadsで並列化する実例',
    status: 'posted',
    platforms: ['instagram', 'threads'],
    createdAt: '2026-04-10 10:00',
    postedAt: '2026-04-11 20:00',
    slides: 7,
    engagement: { likes: 687, saves: 94, replies: 33 },
    author: 'AI Generator',
  },
];

// Carousel slides for the review screen (theme id th_001)
window.SEED_SLIDES = [
  { id: 's1', type: 'cover',   title: 'Promise.all\nを完全に理解する',    sub: '並列処理で10倍速くなる',  bg: 'grad-1' },
  { id: 's2', type: 'intro',   title: 'そもそも Promise.all とは？', body: '複数のPromiseを並列実行し、全て解決したら結果を配列で返す組み込みAPI。', bg: 'grad-2' },
  { id: 's3', type: 'code',    title: 'シンプルな使い方', code: 'const [user, posts, tags] =\n  await Promise.all([\n    fetchUser(id),\n    fetchPosts(id),\n    fetchTags(id),\n  ]);', bg: 'grad-3' },
  { id: 's4', type: 'compare', title: '直列 vs 並列',  body: '3つのAPIコール。それぞれ300ms。\n\n直列: 900ms\n並列: 300ms', bg: 'grad-4' },
  { id: 's5', type: 'warning', title: '1つでも失敗すると全部Reject', body: 'allSettled を使うと失敗した promise を個別に受け取れる。', bg: 'grad-5' },
  { id: 's6', type: 'code',    title: 'allSettled の例', code: 'const results =\n  await Promise.allSettled([...]);\n\nresults.forEach(r => {\n  if (r.status === "fulfilled") {\n    // ...\n  }\n});', bg: 'grad-3' },
  { id: 's7', type: 'cta',     title: '保存して後で見返そう', sub: '@k_grid_blog をフォロー',  bg: 'grad-1' },
];

window.SEED_CAPTION = `Promise.all 完全に理解した人向け📘

複数の非同期処理を並列で実行できる Promise.all。
でも、1つでもrejectされたら全部落ちる落とし穴…

allSettled との使い分け、できていますか？

スライドで詳しく解説したのでスワイプ👉

---
もっとJSのTips欲しい人は @k_grid_blog をフォロー`;

window.SEED_HASHTAGS = [
  'JavaScript','TypeScript','Promise','非同期処理',
  'プログラミング','Web開発','駆け出しエンジニア','エンジニア勉強中','フロントエンド'
];

window.SEED_THREADS_TEXT = `Promise.all のおさらいスレ🧵

・複数のPromiseを並列実行
・全部解決したら配列で返す
・1つでも失敗したら即reject

失敗を個別に扱いたいなら Promise.allSettled を。
直列なら 900ms → 並列なら 300ms の世界。

ブログ記事に詳しく書きました
→ k-grid.blog/promise-all`;

// ============ SCHEDULE SEED ============
// 2026-04 calendar entries
window.SEED_SCHEDULE = [
  { date: '2026-04-02', items: [
    { id: 'p1', time: '19:00', title: 'CSS Cascade Layersで秩序を取り戻す', platform: 'instagram', status: 'posted' },
    { id: 'p2', time: '19:30', title: 'CSS Cascade Layersで秩序を取り戻す', platform: 'threads', status: 'posted' },
  ]},
  { date: '2026-04-04', items: [
    { id: 'p3', time: '08:00', title: 'Node.jsのワーカースレッド実践', platform: 'instagram', status: 'posted' },
  ]},
  { date: '2026-04-06', items: [
    { id: 'p4', time: '20:00', title: 'Node.jsのワーカースレッド実践', platform: 'threads', status: 'posted' },
  ]},
  { date: '2026-04-09', items: [
    { id: 'p5', time: '12:00', title: 'useOptimisticフックの実践例', platform: 'instagram', status: 'failed' },
  ]},
  { date: '2026-04-11', items: [
    { id: 'p6', time: '20:00', title: 'Node.jsのワーカースレッド実践', platform: 'instagram', status: 'posted' },
    { id: 'p7', time: '20:30', title: 'Node.jsのワーカースレッド実践', platform: 'threads', status: 'posted' },
  ]},
  { date: '2026-04-15', items: [
    { id: 'p8', time: '19:00', title: 'CSS Cascade Layersで秩序を取り戻す', platform: 'instagram', status: 'posted' },
  ]},
  { date: '2026-04-18', items: [
    { id: 'p9', time: '21:00', title: 'React Server Componentsの誤解3つ', platform: 'instagram', status: 'scheduled' },
  ]},
  { date: '2026-04-19', items: [
    { id: 'p10', time: '19:00', title: 'TypeScriptのsatisfies演算子入門', platform: 'instagram', status: 'scheduled' },
    { id: 'p11', time: '19:30', title: 'TypeScriptのsatisfies演算子入門', platform: 'threads', status: 'scheduled' },
  ]},
  { date: '2026-04-21', items: [
    { id: 'p12', time: '12:00', title: 'Zodで型安全なフォーム', platform: 'instagram', status: 'scheduled' },
  ]},
  { date: '2026-04-23', items: [
    { id: 'p13', time: '20:00', title: 'Bun 1.2で何が変わった？', platform: 'threads', status: 'scheduled' },
  ]},
  { date: '2026-04-26', items: [
    { id: 'p14', time: '19:00', title: 'Next.js 15のキャッシュ戦略', platform: 'instagram', status: 'scheduled' },
    { id: 'p15', time: '19:30', title: 'Next.js 15のキャッシュ戦略', platform: 'threads', status: 'scheduled' },
  ]},
];

// ============ LOGS SEED ============
window.SEED_LOGS = [
  { at: '2026-04-18 08:02', theme: 'React Server Componentsの誤解3つ', platform: 'instagram', status: 'generating', dur: '—' },
  { at: '2026-04-17 21:00', theme: 'Promise.allについて解説したい',   platform: 'instagram', status: 'review',     dur: '2m 41s' },
  { at: '2026-04-17 21:00', theme: 'Promise.allについて解説したい',   platform: 'threads',   status: 'review',     dur: '1m 02s' },
  { at: '2026-04-15 19:00', theme: 'CSS Cascade Layersで秩序を取り戻す', platform: 'instagram', status: 'posted', dur: '14s' },
  { at: '2026-04-15 19:30', theme: 'CSS Cascade Layersで秩序を取り戻す', platform: 'threads',   status: 'posted', dur: '3s' },
  { at: '2026-04-13 18:05', theme: 'useOptimisticフックの実践例',       platform: 'instagram', status: 'failed', dur: '—',   err: 'Image API timeout after 60s' },
  { at: '2026-04-11 20:00', theme: 'Node.jsのワーカースレッド実践',     platform: 'instagram', status: 'posted', dur: '12s' },
  { at: '2026-04-11 20:30', theme: 'Node.jsのワーカースレッド実践',     platform: 'threads',   status: 'posted', dur: '4s' },
  { at: '2026-04-10 09:12', theme: 'Node.jsのワーカースレッド実践',     platform: 'instagram', status: 'generating', dur: '3m 22s' },
  { at: '2026-04-08 19:00', theme: 'Zustandで状態管理をシンプルに',     platform: 'instagram', status: 'posted', dur: '11s' },
  { at: '2026-04-06 20:00', theme: 'CSSの:has()実用例',                platform: 'threads',   status: 'posted', dur: '2s' },
  { at: '2026-04-04 08:00', theme: 'Dockerfileのベストプラクティス',   platform: 'instagram', status: 'posted', dur: '13s' },
];

window.SEED_STATS_BY_WEEK = [
  { w: 'W14', ig: 3, th: 2 },
  { w: 'W15', ig: 4, th: 4 },
  { w: 'W16', ig: 2, th: 3 },
  { w: 'W17', ig: 5, th: 4 },
  { w: 'W18', ig: 3, th: 3 }, // partial / upcoming
];
