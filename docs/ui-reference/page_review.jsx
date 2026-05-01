// /dashboard/review/[id] — 3-pane editor
const GRADIENT_BG = {
  'grad-1': 'linear-gradient(135deg, #1A1033 0%, #2D1B4E 50%, #4C1D95 100%)',
  'grad-2': 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
  'grad-3': 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
  'grad-4': 'linear-gradient(135deg, #3B0764 0%, #581C87 50%, #6B21A8 100%)',
  'grad-5': 'linear-gradient(135deg, #450A0A 0%, #7F1D1D 50%, #991B1B 100%)',
};

function ReviewPage({ id, setRoute }) {
  const theme = window.SEED_THEMES.find(t => t.id === id) || window.SEED_THEMES[0];
  const [slides, setSlides] = useState(window.SEED_SLIDES);
  const [selectedId, setSelectedId] = useState(slides[0].id);
  const [caption, setCaption] = useState(window.SEED_CAPTION);
  const [hashtags, setHashtags] = useState(window.SEED_HASHTAGS);
  const [threadsText, setThreadsText] = useState(window.SEED_THREADS_TEXT);
  const [newTag, setNewTag] = useState('');
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const selected = slides.find(s => s.id === selectedId);
  const selectedIdx = slides.findIndex(s => s.id === selectedId);

  const updateSlide = (patch) => {
    setSlides(prev => prev.map(s => s.id === selectedId ? { ...s, ...patch } : s));
  };

  const handleDrop = (targetId) => {
    if (!draggingId || draggingId === targetId) return;
    const from = slides.findIndex(s => s.id === draggingId);
    const to = slides.findIndex(s => s.id === targetId);
    const next = [...slides];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setSlides(next);
    setDraggingId(null);
    setDragOverId(null);
  };

  const addTag = () => {
    const v = newTag.trim().replace(/^#/, '');
    if (v && !hashtags.includes(v)) setHashtags([...hashtags, v]);
    setNewTag('');
  };
  const removeTag = (t) => setHashtags(hashtags.filter(h => h !== t));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px - 56px)', margin: '-28px -32px -48px', minHeight: 720 }}>
      {/* Sub-header */}
      <div style={{
        padding: '16px 28px',
        borderBottom: '1px solid var(--line-soft)',
        display: 'flex', alignItems: 'center', gap: 14,
        background: 'var(--bg-0)',
      }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setRoute({ page: 'themes' })}>
          <I.ChevronL size={13}/> テーマ一覧に戻る
        </button>
        <div className="vdivider" style={{ height: 24 }}/>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 16, fontWeight: 600, margin: 0, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{theme.title}</h1>
            <StatusBadge status="review"/>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {theme.id} · {theme.createdAt} · AI: Claude Sonnet 4.5
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }}/>
          保存済み · 18:42
        </div>
        <button className="btn btn-secondary"><I.Eye/> プレビュー</button>
      </div>

      {/* 3 panes */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '260px 1fr 380px', overflow: 'hidden', minHeight: 0 }}>
        {/* Left pane — slide thumbs */}
        <div style={{
          borderRight: '1px solid var(--line-soft)',
          background: 'var(--bg-1)',
          display: 'flex', flexDirection: 'column', minHeight: 0,
        }}>
          <div style={{
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid var(--line-soft)',
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>カルーセルスライド</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                {slides.length} slides · 1080×1080
              </div>
            </div>
            <button className="icon-btn" style={{ width: 26, height: 26 }}><I.Plus size={13}/></button>
          </div>

          <div style={{ overflowY: 'auto', padding: 12, flex: 1 }}>
            {slides.map((s, i) => (
              <div
                key={s.id}
                draggable
                onDragStart={() => setDraggingId(s.id)}
                onDragEnd={() => { setDraggingId(null); setDragOverId(null); }}
                onDragOver={(e) => { e.preventDefault(); setDragOverId(s.id); }}
                onDragLeave={() => setDragOverId(null)}
                onDrop={() => handleDrop(s.id)}
                onClick={() => setSelectedId(s.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: 8,
                  borderRadius: 8,
                  marginBottom: 6,
                  cursor: 'pointer',
                  background: selectedId === s.id ? 'var(--accent-soft)' : 'transparent',
                  border: `1px solid ${selectedId === s.id ? 'var(--accent-border)' : (dragOverId === s.id ? 'var(--accent-border)' : 'transparent')}`,
                  opacity: draggingId === s.id ? 0.4 : 1,
                  transition: 'background 0.1s',
                }}>
                <div style={{ color: 'var(--text-4)', cursor: 'grab' }}><I.Drag size={14}/></div>
                <SlideThumb slide={s} index={i} size={56}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12, fontWeight: 500,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {s.title.split('\n')[0]}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 0.05 }}>
                    {String(i+1).padStart(2, '0')} · {s.type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center pane — editor */}
        <div style={{ overflowY: 'auto', padding: '24px 28px', background: 'var(--bg-0)', minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 0.1 }}>
                Slide {String(selectedIdx+1).padStart(2,'0')} / {String(slides.length).padStart(2,'0')} — {selected.type}
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: '3px 0 0' }}>スライド編集</h2>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-ghost btn-sm"><I.Wand size={13}/> AIで書き直す</button>
              <button className="btn btn-ghost btn-sm btn-danger"><I.Trash size={13}/></button>
            </div>
          </div>

          {/* Preview */}
          <div style={{ display: 'grid', placeItems: 'center', marginBottom: 20 }}>
            <div style={{
              width: 360, height: 360,
              borderRadius: 14,
              border: '1px solid var(--line)',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 20px 60px -20px rgba(0,0,0,0.5)',
            }}>
              <SlideCanvas slide={selected} />
              <div style={{
                position: 'absolute', bottom: 10, right: 10,
                padding: '3px 8px',
                fontSize: 10.5,
                fontFamily: 'var(--font-mono)',
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 20,
                color: 'rgba(255,255,255,0.8)',
              }}>
                {selectedIdx+1} / {slides.length}
              </div>
            </div>
          </div>

          {/* Form based on slide type */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 620, margin: '0 auto' }}>
            <div>
              <label className="field-label">タイトル</label>
              <textarea className="textarea" value={selected.title}
                onChange={e => updateSlide({ title: e.target.value })}
                rows={2} style={{ minHeight: 60 }}/>
            </div>

            {selected.sub != null && (
              <div>
                <label className="field-label">サブタイトル</label>
                <input className="input" value={selected.sub} onChange={e => updateSlide({ sub: e.target.value })}/>
              </div>
            )}

            {selected.body != null && (
              <div>
                <label className="field-label">本文</label>
                <textarea className="textarea" value={selected.body}
                  onChange={e => updateSlide({ body: e.target.value })}
                  rows={4}/>
              </div>
            )}

            {selected.code != null && (
              <div>
                <label className="field-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <I.Code size={12}/> コードブロック
                  <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>
                    language: <span style={{ color: 'var(--accent-2)' }}>javascript</span>
                  </span>
                </label>
                <textarea
                  className="textarea"
                  value={selected.code}
                  onChange={e => updateSlide({ code: e.target.value })}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12.5,
                    lineHeight: 1.6,
                    minHeight: 180,
                    background: '#0A0A14',
                    color: '#E8E8F0',
                  }}/>
                <div className="field-hint">カルーセル上ではシンタックスハイライトが適用されます</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '12px 14px', background: 'var(--bg-1)', border: '1px solid var(--line-soft)', borderRadius: 10 }}>
              <I.Image size={14} style={{ color: 'var(--text-3)' }}/>
              <div style={{ fontSize: 12.5 }}>
                <div style={{ fontWeight: 500 }}>背景スタイル</div>
                <div style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                  {selected.bg} · gradient preset
                </div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                {Object.keys(GRADIENT_BG).map(k => (
                  <button key={k} onClick={() => updateSlide({ bg: k })}
                    style={{
                      width: 22, height: 22, borderRadius: 6,
                      background: GRADIENT_BG[k],
                      border: `2px solid ${selected.bg === k ? 'var(--accent)' : 'transparent'}`,
                      outline: selected.bg === k ? 'none' : '1px solid var(--line)',
                      cursor: 'pointer',
                    }}/>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right pane */}
        <div style={{
          borderLeft: '1px solid var(--line-soft)',
          background: 'var(--bg-1)',
          display: 'flex', flexDirection: 'column', minHeight: 0,
        }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--line-soft)' }}>
            <RightTab label="Instagram" icon={<I.IG size={12}/>} active count={caption.length}/>
            <RightTab label="Threads" icon={<I.Threads size={12}/>} count={threadsText.length}/>
          </div>

          <div style={{ overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
            <div>
              <label className="field-label" style={{ display: 'flex', alignItems: 'center' }}>
                <span>キャプション</span>
                <span style={{
                  marginLeft: 'auto',
                  fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)',
                }}>
                  {caption.length} / 2,200
                </span>
              </label>
              <textarea
                className="textarea"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                rows={9}
                style={{ fontSize: 13, lineHeight: 1.6 }}/>
            </div>

            <div>
              <label className="field-label" style={{ display: 'flex', alignItems: 'center' }}>
                <I.Hash size={12} style={{ marginRight: 5 }}/>ハッシュタグ
                <span style={{
                  marginLeft: 'auto',
                  fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)',
                }}>
                  {hashtags.length} / 30
                </span>
              </label>
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 6,
                padding: 8,
                background: 'var(--bg-2)',
                border: '1px solid var(--line)',
                borderRadius: 8,
                minHeight: 60,
              }}>
                {hashtags.map(t => (
                  <span key={t} className="tag">
                    #{t}
                    <button className="tag-close" onClick={() => removeTag(t)}><I.X/></button>
                  </span>
                ))}
                <input
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); }}}
                  placeholder="+ タグを追加"
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    color: 'var(--text-1)', fontSize: 12, flex: 1, minWidth: 100,
                    fontFamily: 'var(--font-mono)',
                  }}/>
              </div>
              <div className="field-hint">Enterで追加 · AI推奨: <span style={{ color: 'var(--accent-2)' }}>#並列処理 #async_await</span></div>
            </div>

            <div className="divider" style={{ margin: '4px 0' }}/>

            <div>
              <label className="field-label" style={{ display: 'flex', alignItems: 'center' }}>
                <I.Threads size={12} style={{ marginRight: 6 }}/>Threads 投稿本文
                <span style={{
                  marginLeft: 'auto',
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  color: threadsText.length > 500 ? 'var(--danger)' : (threadsText.length > 450 ? 'var(--warning)' : 'var(--text-3)'),
                }}>
                  {threadsText.length} / 500
                </span>
              </label>
              <textarea
                className="textarea"
                value={threadsText}
                onChange={e => setThreadsText(e.target.value)}
                rows={8}
                style={{ fontSize: 13, lineHeight: 1.6 }}/>
              {/* progress bar */}
              <div style={{ height: 3, background: 'var(--bg-3)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, threadsText.length/500*100)}%`,
                  background: threadsText.length > 500 ? 'var(--danger)' : (threadsText.length > 450 ? 'var(--warning)' : 'linear-gradient(90deg, #8B7CF6, #B07CF6)'),
                  transition: 'width 0.2s',
                }}/>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div style={{
        borderTop: '1px solid var(--line-soft)',
        background: 'var(--bg-1)',
        padding: '12px 28px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'var(--text-2)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <I.Check size={12} style={{ color: 'var(--success)' }}/> 本文
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <I.Check size={12} style={{ color: 'var(--success)' }}/> キャプション
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--text-3)' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px dashed var(--text-3)' }}/> 画像
          </span>
        </div>
        <div style={{ flex: 1 }}/>
        <button className="btn btn-secondary"><I.Image/> 画像を生成</button>
        <button className="btn btn-primary"><I.Calendar/> スケジュール登録</button>
      </div>
    </div>
  );
}

function RightTab({ label, icon, active, count }) {
  return (
    <button style={{
      flex: 1,
      padding: '12px 14px',
      fontSize: 12.5,
      fontWeight: 500,
      color: active ? 'var(--text-1)' : 'var(--text-3)',
      borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
      background: active ? 'var(--bg-2)' : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    }}>
      {icon} {label}
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-4)' }}>{count}</span>
    </button>
  );
}

// Actual slide rendering
function SlideCanvas({ slide }) {
  const bg = GRADIENT_BG[slide.bg] || GRADIENT_BG['grad-1'];
  return (
    <div style={{
      width: '100%', height: '100%',
      background: bg,
      position: 'relative',
      overflow: 'hidden',
      padding: 36,
      display: 'flex',
      flexDirection: 'column',
      color: '#fff',
    }}>
      {/* Background decorative grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)',
        backgroundSize: '24px 24px',
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
      }}/>

      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        position: 'relative',
      }}>
        @k_grid_blog
      </div>

      {slide.type === 'cover' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.03em', whiteSpace: 'pre-line' }}>
            {slide.title}
          </div>
          {slide.sub && (
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 12 }}>{slide.sub}</div>
          )}
          <div style={{
            position: 'absolute', bottom: -8, right: -8,
            fontSize: 120, fontWeight: 800,
            color: 'rgba(255,255,255,0.05)',
            letterSpacing: '-0.05em',
          }}>01</div>
        </div>
      )}

      {slide.type === 'intro' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, marginBottom: 14, letterSpacing: '-0.02em' }}>
            {slide.title}
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.85)' }}>{slide.body}</div>
        </div>
      )}

      {slide.type === 'code' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', paddingTop: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, letterSpacing: '-0.02em' }}>
            {slide.title}
          </div>
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: '14px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            lineHeight: 1.6,
            color: '#E8E8F0',
            whiteSpace: 'pre-wrap',
            flex: 1,
            overflow: 'hidden',
          }}>
            <SyntaxHighlight code={slide.code}/>
          </div>
        </div>
      )}

      {slide.type === 'compare' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 20, letterSpacing: '-0.02em' }}>{slide.title}</div>
          <div style={{ fontSize: 13, lineHeight: 1.8, color: 'rgba(255,255,255,0.85)', whiteSpace: 'pre-line' }}>{slide.body}</div>
        </div>
      )}

      {slide.type === 'warning' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          <div style={{
            padding: '3px 10px', background: 'rgba(248,113,113,0.2)',
            color: '#fecaca', fontSize: 10, fontFamily: 'var(--font-mono)',
            borderRadius: 20, alignSelf: 'flex-start', marginBottom: 12,
            border: '1px solid rgba(248,113,113,0.4)',
          }}>⚠ CAUTION</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 14, lineHeight: 1.3, letterSpacing: '-0.02em' }}>{slide.title}</div>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.85)' }}>{slide.body}</div>
        </div>
      )}

      {slide.type === 'cta' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
          <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em' }}>{slide.title}</div>
          {slide.sub && (
            <div style={{
              fontSize: 13, color: 'rgba(255,255,255,0.75)',
              marginTop: 14,
              padding: '6px 14px',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 20,
              fontFamily: 'var(--font-mono)',
            }}>{slide.sub}</div>
          )}
        </div>
      )}
    </div>
  );
}

function SyntaxHighlight({ code }) {
  // Very simple JS tokenization for demo
  const keywords = /\b(const|let|var|await|async|function|return|if|else|for|of|in|new|class|import|export|from)\b/g;
  const tokens = code
    .split('\n')
    .map((line, i) => {
      let html = line
        .replace(/(["'`])((?:\\.|(?!\1).)*)\1/g, '<span style="color:#86EFAC">$&</span>')
        .replace(/\b([A-Za-z_]\w*)(?=\()/g, '<span style="color:#93C5FD">$1</span>')
        .replace(keywords, '<span style="color:#C4B5FD">$1</span>')
        .replace(/\/\/.*$/, '<span style="color:#6B7280;font-style:italic">$&</span>');
      return `<div><span style="color:rgba(255,255,255,0.3);width:18px;display:inline-block;user-select:none">${i+1}</span>${html || ' '}</div>`;
    })
    .join('');
  return <div dangerouslySetInnerHTML={{ __html: tokens }}/>;
}

function SlideThumb({ slide, index, size = 56 }) {
  const bg = GRADIENT_BG[slide.bg] || GRADIENT_BG['grad-1'];
  return (
    <div style={{
      width: size, height: size,
      borderRadius: 6,
      background: bg,
      flexShrink: 0,
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: 4,
        fontSize: 8, color: 'rgba(255,255,255,0.7)',
        fontFamily: 'var(--font-mono)',
      }}>
        {String(index+1).padStart(2,'0')}
      </div>
      <div style={{
        position: 'absolute', left: 4, right: 4, top: 14,
        fontSize: 6, lineHeight: 1.2,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: 700,
        whiteSpace: 'pre-line',
        overflow: 'hidden',
        height: size - 18,
      }}>
        {slide.title.split('\n')[0].slice(0, 24)}
      </div>
    </div>
  );
}

Object.assign(window, { ReviewPage });

// Add shimmer + spin animations
if (!document.getElementById('anim-styles')) {
  const s = document.createElement('style');
  s.id = 'anim-styles';
  s.textContent = `
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
@keyframes spin { to { transform: rotate(360deg); } }
`;
  document.head.appendChild(s);
}
