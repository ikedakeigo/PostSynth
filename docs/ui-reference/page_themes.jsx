// /dashboard/themes — list + new theme form
function ThemesPage({ setRoute }) {
  const [prompt, setPrompt] = useState('Promise.allについて解説したい');
  const [plats, setPlats] = useState({ instagram: true, threads: true });
  const [filter, setFilter] = useState('all');
  const themes = window.SEED_THEMES;

  const filtered = filter === 'all' ? themes : themes.filter(t => t.status === filter);
  const counts = themes.reduce((a, t) => (a[t.status] = (a[t.status]||0)+1, a), {});

  const toggle = (k) => setPlats(p => ({ ...p, [k]: !p[k] }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">テーマ一覧</h1>
          <p className="page-sub">AIで生成した投稿テーマを管理・レビューできます</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary"><I.Download/> エクスポート</button>
          <button className="btn btn-primary" onClick={() => document.getElementById('new-theme-input')?.focus()}>
            <I.Plus/> 新規テーマ作成
          </button>
        </div>
      </div>

      {/* ======= New theme form ======= */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(139,124,246,0.06), rgba(139,124,246,0.0) 70%), var(--bg-1)',
        border: '1px solid rgba(139,124,246,0.18)',
        borderRadius: 14,
        padding: 20,
        marginBottom: 28,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative corner gradient */}
        <div style={{
          position: 'absolute', top: -80, right: -80, width: 280, height: 280,
          background: 'radial-gradient(circle, rgba(176,124,246,0.18), transparent 65%)',
          pointerEvents: 'none',
        }}/>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'linear-gradient(135deg, #8B7CF6, #B07CF6)',
            display: 'grid', placeItems: 'center', color: '#fff',
          }}>
            <I.Sparkle size={14}/>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>新しいテーマをAIで生成</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>1テーマから Instagramカルーセル + Threads投稿を同時生成</div>
          </div>
          <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>
            credits: <span style={{ color: 'var(--accent-2)' }}>1,248</span> / 2,000
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 16, position: 'relative' }}>
          <div>
            <label className="field-label">テーマ / 発信したい内容</label>
            <textarea
              id="new-theme-input"
              className="textarea"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder='例: "Promise.allについて解説したい"'
              rows={3}
              style={{ minHeight: 90 }}
            />
            <div className="field-hint">
              自然な日本語でOK。AIがスライド構成・コード例・キャプション・ハッシュタグまで生成します。
            </div>
          </div>

          <div>
            <label className="field-label">対象プラットフォーム</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className={`checkbox-row ${plats.instagram ? 'checked' : ''}`} onClick={() => toggle('instagram')}>
                <div className="check-box"><I.Check/></div>
                <I.IG size={13}/>
                <span>Instagram カルーセル</span>
              </div>
              <div className={`checkbox-row ${plats.threads ? 'checked' : ''}`} onClick={() => toggle('threads')}>
                <div className="check-box"><I.Check/></div>
                <I.Threads size={13}/>
                <span>Threads 投稿</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['コード解説風', 'カジュアル', 'フォーマル', '初心者向け'].map((t, i) => (
              <button key={t} className="btn btn-sm btn-secondary" style={i===0 ? {
                borderColor: 'var(--accent-border)', background: 'var(--accent-soft)', color: 'var(--accent-2)',
              } : {}}>
                {t}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }}/>
          <button className="btn btn-ghost">詳細オプション <I.ChevronD size={12}/></button>
          <button className="btn btn-primary" style={{ padding: '9px 18px' }}>
            <I.Sparkle/> AIで生成
          </button>
        </div>
      </div>

      {/* ======= Filter + list ======= */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <FilterTabs
          value={filter}
          onChange={setFilter}
          options={[
            { id: 'all', label: 'すべて', count: themes.length },
            { id: 'draft', label: 'Draft', count: counts.draft||0 },
            { id: 'generating', label: 'Generating', count: counts.generating||0 },
            { id: 'review', label: 'Review', count: counts.review||0 },
            { id: 'scheduled', label: 'Scheduled', count: counts.scheduled||0 },
            { id: 'posted', label: 'Posted', count: counts.posted||0 },
            { id: 'failed', label: 'Failed', count: counts.failed||0 },
          ]}
        />
        <div style={{ flex: 1 }}/>
        <button className="btn btn-secondary btn-sm"><I.Filter/> 条件で絞り込み</button>
        <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
          {filtered.length} / {themes.length}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: 14,
      }}>
        {filtered.map(t => <ThemeCard key={t.id} theme={t} onReview={() => setRoute({ page: 'review', id: t.id })}/>)}
      </div>
    </div>
  );
}

function FilterTabs({ value, onChange, options }) {
  return (
    <div style={{
      display: 'inline-flex',
      background: 'var(--bg-1)',
      border: '1px solid var(--line-soft)',
      borderRadius: 10,
      padding: 3,
      gap: 2,
    }}>
      {options.map(o => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          style={{
            padding: '5px 11px',
            fontSize: 12.5,
            fontWeight: 500,
            color: value === o.id ? '#fff' : 'var(--text-2)',
            background: value === o.id ? 'var(--bg-3)' : 'transparent',
            border: value === o.id ? '1px solid var(--line)' : '1px solid transparent',
            borderRadius: 7,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            transition: 'background 0.1s, color 0.1s',
          }}>
          {o.label}
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10.5,
            color: value === o.id ? 'var(--accent-2)' : 'var(--text-4)',
          }}>{o.count}</span>
        </button>
      ))}
    </div>
  );
}

function ThemeCard({ theme, onReview }) {
  const t = theme;
  const isActionable = t.status !== 'generating';
  return (
    <div style={{
      background: 'var(--bg-1)',
      border: '1px solid var(--line-soft)',
      borderRadius: 12,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      transition: 'border-color 0.12s, transform 0.12s',
      position: 'relative',
      overflow: 'hidden',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--line)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line-soft)'}>

      {/* generating shimmer top-bar */}
      {t.status === 'generating' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.6s linear infinite',
        }}/>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <StatusBadge status={t.status}/>
          {t.platforms.map(p => <PlatChip key={p} p={p}/>)}
        </div>
        <button className="icon-btn" style={{ width: 26, height: 26 }}><I.More size={14}/></button>
      </div>

      <div>
        <div style={{
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          lineHeight: 1.35,
          marginBottom: 6,
          minHeight: 40,
        }}>{t.title}</div>
        <div style={{
          fontSize: 12.5,
          color: 'var(--text-3)',
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: 36,
        }}>{t.prompt}</div>
      </div>

      <div style={{
        display: 'flex',
        gap: 14,
        fontSize: 11.5,
        color: 'var(--text-3)',
        fontFamily: 'var(--font-mono)',
        paddingTop: 10,
        borderTop: '1px solid var(--line-soft)',
      }}>
        <span><I.Clock size={11} style={{ verticalAlign: -1, marginRight: 4 }}/>{t.createdAt.split(' ')[0]}</span>
        {t.slides != null && <span>{t.slides} slides</span>}
        {t.scheduledAt && (
          <span style={{ color: 'var(--accent-2)' }}>
            → {t.scheduledAt.slice(5).replace('-','/')}
          </span>
        )}
        {t.postedAt && t.engagement && (
          <span style={{ color: 'var(--success)' }}>
            ♡ {t.engagement.likes}
          </span>
        )}
        {t.status === 'failed' && t.errorNote && (
          <span style={{ color: 'var(--danger)' }} title={t.errorNote}>
            <I.AlertTri size={11} style={{ verticalAlign: -1, marginRight: 4 }}/>{t.errorNote}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {t.status === 'generating' ? (
          <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }} disabled>
            <I.Refresh size={12} style={{ animation: 'spin 1.2s linear infinite' }}/> 生成中...
          </button>
        ) : t.status === 'posted' ? (
          <>
            <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
              <I.Chart size={12}/> 成績を見る
            </button>
            <button className="btn btn-ghost btn-sm"><I.Eye size={12}/></button>
          </>
        ) : t.status === 'failed' ? (
          <>
            <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
              <I.Refresh size={12}/> 再生成
            </button>
            <button className="btn btn-ghost btn-sm btn-danger"><I.Trash size={12}/></button>
          </>
        ) : (
          <>
            <button
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={onReview}>
              <I.Edit size={12}/> レビュー
            </button>
            <button className="btn btn-ghost btn-sm btn-danger"><I.Trash size={12}/></button>
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { ThemesPage, ThemeCard, FilterTabs });
