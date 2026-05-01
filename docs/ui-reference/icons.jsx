// Central icon set. Outline style, 1.6 stroke, currentColor.
const Icon = ({ d, size = 16, fill, stroke = 1.6, children, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || 'none'}
    stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" {...p}>
    {children || <path d={d} />}
  </svg>
);

const I = {
  Plus: (p) => <Icon d="M12 5v14M5 12h14" {...p} />,
  Sparkle: (p) => <Icon {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/><path d="M19 4v3M20.5 5.5h-3"/></Icon>,
  Search: (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></Icon>,
  Bell: (p) => <Icon d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9zM10 21a2 2 0 0 0 4 0" {...p} />,
  Settings: (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></Icon>,
  Layers: (p) => <Icon {...p}><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 18l9 5 9-5"/></Icon>,
  Calendar: (p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></Icon>,
  Chart: (p) => <Icon {...p}><path d="M3 3v18h18"/><path d="M7 15l3-4 3 3 5-7"/></Icon>,
  Inbox: (p) => <Icon {...p}><path d="M3 13l3-8h12l3 8"/><path d="M3 13h6l1 3h4l1-3h6v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6z"/></Icon>,
  Trash: (p) => <Icon {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14"/></Icon>,
  Edit: (p) => <Icon d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" {...p} />,
  Eye: (p) => <Icon {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></Icon>,
  Check: (p) => <Icon d="M5 12l5 5L20 7" {...p} />,
  X: (p) => <Icon d="M6 6l12 12M18 6L6 18" {...p} />,
  ChevronR: (p) => <Icon d="M9 6l6 6-6 6" {...p} />,
  ChevronL: (p) => <Icon d="M15 6l-6 6 6 6" {...p} />,
  ChevronD: (p) => <Icon d="M6 9l6 6 6-6" {...p} />,
  Filter: (p) => <Icon d="M3 5h18l-7 9v6l-4-2v-4L3 5z" {...p} />,
  Clock: (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
  Drag: (p) => <Icon {...p} fill="currentColor" stroke="none"><circle cx="9" cy="6" r="1.3"/><circle cx="9" cy="12" r="1.3"/><circle cx="9" cy="18" r="1.3"/><circle cx="15" cy="6" r="1.3"/><circle cx="15" cy="12" r="1.3"/><circle cx="15" cy="18" r="1.3"/></Icon>,
  Image: (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5-11 11"/></Icon>,
  Code: (p) => <Icon d="M8 6l-6 6 6 6M16 6l6 6-6 6M14 4l-4 16" {...p} />,
  Hash: (p) => <Icon d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" {...p} />,
  More: (p) => <Icon {...p} fill="currentColor" stroke="none"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></Icon>,
  AlertTri: (p) => <Icon d="M12 3l10 18H2L12 3zM12 10v5M12 18v.1" {...p} />,
  Refresh: (p) => <Icon d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" {...p} />,
  Send: (p) => <Icon d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" {...p} />,
  Home: (p) => <Icon d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2V10z" {...p} />,
  Play: (p) => <Icon d="M6 4l14 8-14 8V4z" {...p} fill="currentColor" stroke="none"/>,
  Download: (p) => <Icon d="M12 3v12M7 10l5 5 5-5M4 21h16" {...p} />,
  Wand: (p) => <Icon {...p}><path d="M4 20l12-12"/><path d="M15 5l4 4"/><path d="M19 3v2M21 5h-2M19 7v2M21 9h-2"/></Icon>,
  // Platform marks — simple generic glyphs, not brand-replica
  IG: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7"/>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7"/>
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor"/>
    </svg>
  ),
  Threads: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 11.5c-.4-.2-.9-.3-1.5-.4-1-.1-2 .1-2.8.6-.7.5-1 1.2-.8 1.8.2.6 1 1 1.9 1 1.4 0 2.5-.8 2.6-2.7.1-2.2-1.3-3.8-3.5-3.8-1.9 0-3 .9-3.6 2"/>
      <path d="M12 3c-5 0-8 3-8 9s3 9 8 9 8-3 8-9c0-2-.3-3.6-1-5"/>
    </svg>
  ),
};

Object.assign(window, { I, Icon });
