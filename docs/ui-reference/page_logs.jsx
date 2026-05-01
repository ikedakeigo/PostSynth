// /dashboard/logs — stats + logs table
function LogsPage({ setRoute }) {
  const logs = window.SEED_LOGS;
  const [platFilter, setPlatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = logs.filter(l => {
    if (platFilter !== 'all' && l.platform !== platFilter) return false;
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    return true;
  });

  const summary = [
    { label: '今月の投稿数', value: 13, delta: '+4', deltaLabel: 'vs 先月', icon: <I.Send/>, color: 'var(--accent-2)' },
    { label: '生成済み', value: 21, delta: '+8', deltaLabel: '今週', icon: <I.Sparkle/>, color: 'var(--info)' },
    { label: 'スケジュール中', value: 7, delta: '→ 次: 19:00', deltaLabel: 'Today 21:00', icon: <I.Calendar/>, color: 'var(--accent)' },
    { label: '失敗', value: 1, delta: '-2', deltaLabel: 'vs 先月', icon: <I.AlertTri/>, color: 'var(--danger)', down: true },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">投稿ログ・統計</h1>
          <p className="page-sub">自動投稿の実行履歴とパフォーマンス指標</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{
            display: 'inline-flex', background: 'var(--bg-1)',
            border: '1px solid var(--line-soft)', borderRadius: 10, padding: 3,
          }}>
            {['7d','30d','90d','All'].map((l, i) => (
              <button key={l} style={{
                padding: '5px 12px', fontSize: 12, fontWeight: 500,
                color: i === 1 ? '#fff' : 'var(--text-3)',
                background: i === 1 ? 'var(--bg-3)' : 'transparent',
                border: i === 1 ? '1px solid var(--line)' : '1px solid transparent',
                borderRadius: 7,
                fontFamily: 'var(--font-mono)',
              }}>{l}</button>
            ))}
          </div>
          <button className="btn btn-secondary"><I.Download/> CSVエクスポート</button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {summary.map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-1)',
            border: '1px solid var(--line-soft)',
            borderRadius: 12,
            padding: 16,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -40, right: -40, width: 130, height: 130,
              background: `radial-gradient(circle, ${s.color}22, transparent 65%)`,
              pointerEvents: 'none',
            }}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'var(--bg-3)', color: s.color,
                display: 'grid', placeItems: 'center',
                border: '1px solid var(--line)',
              }}>
                {React.cloneElement(s.icon, { size: 14 })}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>{s.label}</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 6 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)' }}>
              <span style={{
                color: s.down ? 'var(--success)' : s.color,
                fontWeight: 600,
              }}>{s.delta}</span>
              <span style={{ color: 'var(--text-3)' }}>{s.deltaLabel}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + platform split */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>プラットフォーム別の投稿数</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                直近5週間 · weekly
              </div>
            </div>
            <div style={{ flex: 1 }}/>
            <div style={{ display: 'flex', gap: 14, fontSize: 11.5 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: 'linear-gradient(180deg, #B07CF6, #8B7CF6)' }}/>
                Instagram
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#3F3F5A' }}/>
                Threads
              </span>
            </div>
          </div>

          <BarChart data={window.SEED_STATS_BY_WEEK}/>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>エンゲージメント</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: 18 }}>
            直近の平均 · per post
          </div>

          <EngagementRow label="♡ Likes" value={487} color="var(--rose)" maxVal={600}/>
          <EngagementRow label="⌯ Saves" value={68} color="var(--accent-2)" maxVal={100}/>
          <EngagementRow label="↻ Reposts" value={24} color="var(--info)" maxVal={50}/>
          <EngagementRow label="💬 Replies" value={17} color="var(--success)" maxVal={50}/>

          <div style={{
            marginTop: 16, padding: 12,
            borderRadius: 10,
            background: 'rgba(139,124,246,0.08)',
            border: '1px solid var(--accent-border)',
            fontSize: 12,
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <I.Sparkle size={13} style={{ color: 'var(--accent-2)', marginTop: 2, flexShrink: 0 }}/>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>AIインサイト</div>
              <div style={{ color: 'var(--text-2)', lineHeight: 1.5 }}>
                コード解説系の投稿は平均より <span style={{ color: 'var(--accent-2)', fontFamily: 'var(--font-mono)' }}>+32%</span> のセーブ率。19:00投稿が最も反応が高い傾向。
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logs table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--line-soft)' }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>投稿ログ</div>
          <span style={{ fontSize: 11.5, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
            {filtered.length} / {logs.length} events
          </span>
          <div style={{ flex: 1 }}/>

          <FilterTabs
            value={platFilter}
            onChange={setPlatFilter}
            options={[
              { id: 'all', label: 'All', count: logs.length },
              { id: 'instagram', label: 'IG', count: logs.filter(l => l.platform==='instagram').length },
              { id: 'threads', label: 'Threads', count: logs.filter(l => l.platform==='threads').length },
            ]}
          />
          <FilterTabs
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { id: 'all', label: 'All status', count: logs.length },
              { id: 'posted', label: 'Posted', count: logs.filter(l => l.status==='posted').length },
              { id: 'failed', label: 'Failed', count: logs.filter(l => l.status==='failed').length },
              { id: 'review', label: 'Review', count: logs.filter(l => l.status==='review').length },
              { id: 'generating', label: 'Gen', count: logs.filter(l => l.status==='generating').length },
            ]}
          />
        </div>

        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 160 }}>日時</th>
              <th>テーマ</th>
              <th style={{ width: 130 }}>プラットフォーム</th>
              <th style={{ width: 120 }}>ステータス</th>
              <th style={{ width: 100 }}>処理時間</th>
              <th style={{ width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, i) => (
              <tr key={i}>
                <td className="mono">{l.at}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 500 }}>{l.theme}</span>
                    {l.err && (
                      <span style={{ fontSize: 11, color: 'var(--danger)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                        ⚠ {l.err}
                      </span>
                    )}
                  </div>
                </td>
                <td><PlatChip p={l.platform}/></td>
                <td><StatusBadge status={l.status}/></td>
                <td className="mono" style={{ color: l.status === 'failed' ? 'var(--text-4)' : 'var(--text-2)' }}>{l.dur}</td>
                <td>
                  <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    {l.status === 'failed' && <button className="btn btn-ghost btn-sm" title="再実行"><I.Refresh size={12}/></button>}
                    <button className="btn btn-ghost btn-sm"><I.Eye size={12}/></button>
                    <button className="btn btn-ghost btn-sm"><I.More size={12}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{
          padding: '10px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderTop: '1px solid var(--line-soft)',
          fontSize: 12, color: 'var(--text-3)',
        }}>
          <span className="mono">showing 1-{filtered.length} of {logs.length}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-ghost btn-sm" disabled style={{ opacity: 0.5 }}><I.ChevronL size={12}/></button>
            <button className="btn btn-ghost btn-sm"><I.ChevronR size={12}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.ig + d.th));
  const chartH = 180;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, height: chartH + 40, padding: '0 8px' }}>
      {data.map((d, i) => {
        const igH = (d.ig / max) * chartH;
        const thH = (d.th / max) * chartH;
        return (
          <div key={d.w} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)', fontWeight: 600 }}>
              {d.ig + d.th}
            </div>
            <div style={{
              display: 'flex', flexDirection: 'column-reverse',
              width: '100%', maxWidth: 48,
              height: chartH,
              justifyContent: 'flex-start',
            }}>
              <div style={{
                height: igH,
                background: 'linear-gradient(180deg, #B07CF6 0%, #8B7CF6 100%)',
                borderRadius: '4px 4px 0 0',
                boxShadow: '0 0 12px -2px rgba(139,124,246,0.4)',
                transition: 'height 0.3s',
              }}/>
              <div style={{
                height: thH,
                background: '#3F3F5A',
                borderRadius: igH === 0 ? '4px 4px 0 0' : 0,
                marginBottom: 1,
              }}/>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{d.w}</div>
          </div>
        );
      })}
    </div>
  );
}

function EngagementRow({ label, value, color, maxVal }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
        <span style={{ color: 'var(--text-2)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{value}</span>
      </div>
      <div style={{ height: 6, background: 'var(--bg-3)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, value/maxVal*100)}%`,
          background: color,
          borderRadius: 3,
          opacity: 0.85,
        }}/>
      </div>
    </div>
  );
}

Object.assign(window, { LogsPage });
