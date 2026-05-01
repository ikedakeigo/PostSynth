// /dashboard/schedule — month calendar + day panel
function SchedulePage({ setRoute }) {
  const [filter, setFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('2026-04-19');
  const [monthOffset, setMonthOffset] = useState(0);

  // We'll render April 2026 for offset 0
  const year = 2026;
  const month = 4; // April
  const monthName = 'April';

  const daysInMonth = 30;
  const firstDayIdx = 3; // Wednesday (April 1, 2026 is a Wed) — 0=Sun

  const scheduleByDate = {};
  window.SEED_SCHEDULE.forEach(d => scheduleByDate[d.date] = d.items);

  const matchesFilter = (it) => filter === 'all' ? true : it.status === filter;

  const selectedItems = (scheduleByDate[selectedDate] || []).filter(matchesFilter);

  // Summary
  const totals = window.SEED_SCHEDULE.flatMap(d => d.items).reduce((a, i) => (a[i.status]=(a[i.status]||0)+1, a), {});

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">スケジュール</h1>
          <p className="page-sub">自動投稿される予定をカレンダーで管理</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary"><I.Refresh/> 同期</button>
          <button className="btn btn-primary"><I.Plus/> 手動で予約</button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <FilterTabs
          value={filter}
          onChange={setFilter}
          options={[
            { id: 'all', label: 'All', count: (totals.scheduled||0)+(totals.posted||0)+(totals.failed||0) },
            { id: 'scheduled', label: 'Scheduled', count: totals.scheduled||0 },
            { id: 'posted', label: 'Posted', count: totals.posted||0 },
            { id: 'failed', label: 'Failed', count: totals.failed||0 },
          ]}
        />
        <div style={{ flex: 1 }}/>
        <div style={{
          display: 'inline-flex', background: 'var(--bg-1)',
          border: '1px solid var(--line-soft)', borderRadius: 10, padding: 3,
        }}>
          {['Month','Week','List'].map((l, i) => (
            <button key={l} style={{
              padding: '5px 14px', fontSize: 12.5, fontWeight: 500,
              color: i === 0 ? '#fff' : 'var(--text-3)',
              background: i === 0 ? 'var(--bg-3)' : 'transparent',
              border: i === 0 ? '1px solid var(--line)' : '1px solid transparent',
              borderRadius: 7,
            }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'flex-start' }}>
        {/* Calendar */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>
                {monthName} <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>{year}</span>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                {Object.values(scheduleByDate).flat().length} posts this month
              </div>
            </div>
            <div style={{ flex: 1 }}/>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="icon-btn" onClick={() => setMonthOffset(o => o-1)}><I.ChevronL/></button>
              <button className="btn btn-secondary btn-sm" onClick={() => setMonthOffset(0)}>Today</button>
              <button className="icon-btn" onClick={() => setMonthOffset(o => o+1)}><I.ChevronR/></button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, i) => (
              <div key={d} style={{
                padding: '6px 8px',
                fontSize: 10.5, fontWeight: 500,
                color: i === 0 ? 'var(--rose)' : (i === 6 ? 'var(--info)' : 'var(--text-3)'),
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontFamily: 'var(--font-mono)',
              }}>{d}</div>
            ))}

            {Array.from({ length: firstDayIdx }).map((_, i) => (
              <div key={`pad-${i}`} style={{
                minHeight: 100, background: 'var(--bg-1)', borderRadius: 8, opacity: 0.4,
                border: '1px solid var(--line-soft)',
              }}/>
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const items = (scheduleByDate[dateStr] || []).filter(matchesFilter);
              const isToday = day === 18;
              const isSelected = selectedDate === dateStr;
              const dow = (firstDayIdx + i) % 7;

              return (
                <div key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  style={{
                    minHeight: 96,
                    minWidth: 0,
                    background: isSelected ? 'var(--accent-soft)' : 'var(--bg-2)',
                    borderRadius: 8,
                    border: `1px solid ${isSelected ? 'var(--accent-border)' : (isToday ? 'rgba(139,124,246,0.25)' : 'var(--line-soft)')}`,
                    padding: '5px 6px',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', gap: 3,
                    transition: 'border-color 0.12s, background 0.12s',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{
                      fontSize: 12,
                      fontWeight: isToday ? 700 : 500,
                      color: isToday ? '#fff' : (dow === 0 ? 'var(--rose)' : (dow === 6 ? 'var(--info)' : 'var(--text-1)')),
                      fontFamily: 'var(--font-mono)',
                      background: isToday ? 'var(--accent)' : 'transparent',
                      width: isToday ? 20 : 'auto', height: isToday ? 20 : 'auto',
                      borderRadius: '50%',
                      display: 'inline-grid', placeItems: 'center',
                    }}>
                      {day}
                    </span>
                    {items.length > 2 && (
                      <span style={{
                        marginLeft: 'auto',
                        fontSize: 9, color: 'var(--text-3)',
                        fontFamily: 'var(--font-mono)',
                      }}>+{items.length - 2}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {items.slice(0, 2).map(it => (
                      <div key={it.id} style={{
                        fontSize: 10,
                        padding: '2px 4px',
                        borderRadius: 4,
                        display: 'flex', alignItems: 'center', gap: 3,
                        background: it.status === 'posted' ? 'rgba(52,211,153,0.10)' :
                                   it.status === 'failed' ? 'rgba(248,113,113,0.10)' :
                                   'rgba(167,139,250,0.10)',
                        border: `1px solid ${it.status === 'posted' ? 'rgba(52,211,153,0.20)' :
                                             it.status === 'failed' ? 'rgba(248,113,113,0.20)' :
                                             'rgba(167,139,250,0.22)'}`,
                        color: it.status === 'posted' ? '#86EFAC' :
                               it.status === 'failed' ? '#FCA5A5' : '#C4B5FD',
                        overflow: 'hidden',
                        minWidth: 0,
                      }}>
                        <span style={{ flexShrink: 0, display: 'inline-flex' }}>
                          {it.platform === 'instagram' ? <I.IG size={9}/> : <I.Threads size={9}/>}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, flexShrink: 0 }}>{it.time}</span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
                          {it.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right side panel */}
        <div className="card" style={{ padding: 18, position: 'sticky', top: 0 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 0.1 }}>
              選択日
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em' }}>
              {fmtDateLong(selectedDate)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
              {selectedItems.length}件の投稿予定
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {selectedItems.length === 0 && (
              <div style={{
                padding: 24,
                border: '1px dashed var(--line)',
                borderRadius: 10,
                textAlign: 'center',
                color: 'var(--text-3)',
                fontSize: 12.5,
              }}>
                この日の投稿はありません
                <div style={{ marginTop: 8 }}>
                  <button className="btn btn-secondary btn-sm"><I.Plus size={12}/> 投稿を予約</button>
                </div>
              </div>
            )}

            {selectedItems.map(it => (
              <div key={it.id} style={{
                padding: 12,
                background: 'var(--bg-2)',
                border: '1px solid var(--line-soft)',
                borderRadius: 10,
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <PlatDot p={it.platform} size={16}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--accent-2)', fontWeight: 600 }}>
                      {it.time}
                    </span>
                    <StatusBadge status={it.status}/>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.4 }}>{it.title}</div>
                </div>
                <button className="icon-btn" style={{ width: 24, height: 24 }}><I.More size={12}/></button>
              </div>
            ))}
          </div>

          <div className="divider"/>

          {/* Mini stats */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 0.1, marginBottom: 10 }}>
              今月の状況
            </div>
            <MiniBar label="Posted" value={totals.posted||0} total={15} color="var(--success)"/>
            <MiniBar label="Scheduled" value={totals.scheduled||0} total={15} color="var(--accent)"/>
            <MiniBar label="Failed" value={totals.failed||0} total={15} color="var(--danger)"/>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniBar({ label, value, total, color }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
        <span style={{ color: 'var(--text-2)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>
          <span style={{ color: 'var(--text-1)' }}>{value}</span>/{total}
        </span>
      </div>
      <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value/total*100}%`, background: color, borderRadius: 2 }}/>
      </div>
    </div>
  );
}

function fmtDateLong(d) {
  const parts = d.split('-');
  const dObj = new Date(+parts[0], +parts[1]-1, +parts[2]);
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return `${parts[0]}.${parts[1]}.${parts[2]} (${days[dObj.getDay()]})`;
}

Object.assign(window, { SchedulePage });
