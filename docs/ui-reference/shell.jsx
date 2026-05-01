// App shell — sidebar, topbar, route switcher
const { useState, useEffect, useMemo, useRef, useCallback } = React;

function Sidebar({ route, setRoute, counts }) {
  const items = [
    { id: 'themes', label: 'テーマ一覧', icon: <I.Layers/>, badge: counts.themes },
    { id: 'schedule', label: 'スケジュール', icon: <I.Calendar/>, badge: counts.scheduled },
    { id: 'logs', label: '投稿ログ・統計', icon: <I.Chart/> },
  ];
  const sub = [
    { id: 'inbox', label: '通知', icon: <I.Inbox/>, badge: 3, disabled: true },
    { id: 'settings', label: '設定', icon: <I.Settings/>, disabled: true },
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">P</div>
        <div>
          <div className="brand-name">PostSynth</div>
          <div className="brand-sub">v0.4.1</div>
        </div>
      </div>

      <div className="nav-section-title">Workspace</div>
      {items.map(it => (
        <div key={it.id}
          className={`nav-item ${route.page === it.id || (it.id === 'themes' && route.page === 'review') ? 'active' : ''}`}
          onClick={() => setRoute({ page: it.id })}>
          {it.icon}
          <span>{it.label}</span>
          {it.badge != null && <span className="nav-badge">{it.badge}</span>}
        </div>
      ))}

      <div className="nav-section-title">General</div>
      {sub.map(it => (
        <div key={it.id}
          className="nav-item"
          style={{ opacity: it.disabled ? 0.55 : 1, cursor: it.disabled ? 'default' : 'pointer' }}>
          {it.icon}
          <span>{it.label}</span>
          {it.badge != null && <span className="nav-badge">{it.badge}</span>}
        </div>
      ))}

      <div className="user-card">
        <div className="avatar">KG</div>
        <div style={{ minWidth: 0 }}>
          <div className="user-handle">@k_grid_blog</div>
          <div className="user-meta">Pro plan</div>
        </div>
        <div style={{ marginLeft: 'auto', color: 'var(--text-3)' }}>
          <I.ChevronD size={14}/>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ crumbs = [], right }) {
  return (
    <div className="topbar">
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="crumb-sep"><I.ChevronR size={12}/></span>}
            <span className={i === crumbs.length - 1 ? 'crumb-current' : ''}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="topbar-spacer"/>
      <div className="search-bar">
        <I.Search size={14}/>
        <span>テーマやキャプションを検索</span>
        <span className="kbd">⌘K</span>
      </div>
      <button className="icon-btn" title="通知"><I.Bell/></button>
      <button className="icon-btn" title="設定"><I.Settings/></button>
      {right}
    </div>
  );
}

function App() {
  const [route, setRoute] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ps_route')) || { page: 'themes' }; }
    catch { return { page: 'themes' }; }
  });
  useEffect(() => { localStorage.setItem('ps_route', JSON.stringify(route)); }, [route]);

  const themes = window.SEED_THEMES;
  const counts = { themes: themes.length, scheduled: themes.filter(t=>t.status==='scheduled').length };

  let page = null, crumbs = ['Workspace', '—'];
  if (route.page === 'themes') {
    page = <ThemesPage setRoute={setRoute}/>;
    crumbs = ['Workspace', 'テーマ一覧'];
  } else if (route.page === 'review') {
    page = <ReviewPage id={route.id} setRoute={setRoute}/>;
    crumbs = ['Workspace', 'テーマ一覧', `#${route.id} レビュー`];
  } else if (route.page === 'schedule') {
    page = <SchedulePage setRoute={setRoute}/>;
    crumbs = ['Workspace', 'スケジュール'];
  } else if (route.page === 'logs') {
    page = <LogsPage setRoute={setRoute}/>;
    crumbs = ['Workspace', '投稿ログ・統計'];
  }

  return (
    <div className="app">
      <Sidebar route={route} setRoute={setRoute} counts={counts}/>
      <div className="main">
        <Topbar crumbs={crumbs}/>
        <div className="content" data-screen-label={pageLabel(route)}>
          {page}
        </div>
      </div>
    </div>
  );
}

function pageLabel(r) {
  if (r.page === 'themes') return '01 Themes';
  if (r.page === 'review') return '02 Review';
  if (r.page === 'schedule') return '03 Schedule';
  if (r.page === 'logs') return '04 Logs';
  return r.page;
}

Object.assign(window, { App, Sidebar, Topbar });
