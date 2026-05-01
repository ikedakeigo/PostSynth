// Shared small UI atoms
const STATUS_LABEL = {
  draft: 'Draft',
  generating: 'Generating',
  review: 'Review',
  scheduled: 'Scheduled',
  posted: 'Posted',
  failed: 'Failed',
};

function StatusBadge({ status }) {
  return (
    <span className={`badge ${status}`}>
      <span className="dot"/>
      {STATUS_LABEL[status] || status}
    </span>
  );
}

function PlatChip({ p, size = 'md' }) {
  if (p === 'instagram') {
    return <span className={`plat-chip ig`}><I.IG size={size==='sm'?10:11}/>{size!=='sm' && 'Instagram'}</span>;
  }
  return <span className={`plat-chip th`}><I.Threads size={size==='sm'?10:11}/>{size!=='sm' && 'Threads'}</span>;
}

function PlatDot({ p, size = 14 }) {
  // A small square chip with just the icon (for tight layouts)
  const color = p === 'instagram' ? '#F0A8BF' : '#E4E4ED';
  return (
    <span style={{
      width: size+6, height: size+6,
      display: 'inline-grid', placeItems: 'center',
      borderRadius: 5,
      background: p === 'instagram' ? 'rgba(240,168,191,0.10)' : 'rgba(228,228,237,0.08)',
      border: `1px solid ${p === 'instagram' ? 'rgba(240,168,191,0.22)' : 'rgba(228,228,237,0.14)'}`,
      color,
    }}>
      {p === 'instagram' ? <I.IG size={size-2}/> : <I.Threads size={size-2}/>}
    </span>
  );
}

// Empty-image placeholder with subtle diagonal stripes
function StripePlaceholder({ label, style }) {
  return (
    <div style={{
      backgroundImage: 'repeating-linear-gradient(135deg, #1A1A28 0 8px, #14141F 8px 16px)',
      display: 'grid', placeItems: 'center',
      color: 'var(--text-3)',
      fontFamily: 'var(--font-mono)', fontSize: 11,
      ...style,
    }}>
      {label}
    </div>
  );
}

Object.assign(window, { StatusBadge, PlatChip, PlatDot, StripePlaceholder, STATUS_LABEL });
