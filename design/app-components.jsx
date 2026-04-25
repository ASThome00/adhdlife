
/* ── Shared atoms & nav components ── */

const Icons = {
  Dashboard: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Inbox:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>,
  Tasks:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><polyline points="3 6 4 7 6 5"/><polyline points="3 12 4 13 6 11"/><polyline points="3 18 4 19 6 17"/></svg>,
  Habits:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>,
  Reading:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
  Review:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Settings:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  Check:     () => <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.8 7L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Chevron:   ({ open }) => <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{transform:open?'rotate(180deg)':'none',transition:'transform 0.25s'}}><path d="M3.5 5.5L7 9L10.5 5.5" stroke="var(--text-mono)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Close:     () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="var(--text-mono)" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  Plus:      () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="7" y1="1" x2="7" y2="13"/><line x1="1" y1="7" x2="13" y2="7"/></svg>,
  Collapse:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>,
};

const CAT = {
  work:    { ink:'#2563a8', wash:'#e8f0fb', name:'Work'    },
  school:  { ink:'#96334d', wash:'#fdeef2', name:'School'  },
  health:  { ink:'#b34040', wash:'#fceaea', name:'Health'  },
  admin:   { ink:'#b45309', wash:'#fef3dc', name:'Admin'   },
  growth:  { ink:'#0d7a54', wash:'#e4f5ee', name:'Growth'  },
  reading: { ink:'#9d1f6e', wash:'#fce8f3', name:'Reading' },
  social:  { ink:'#b84d0a', wash:'#fef0e6', name:'Social'  },
  home:    { ink:'#4b5563', wash:'#f0f0ef', name:'Home'    },
};
const PRIO = { HIGH:'#b34040', MEDIUM:'#b45309', LOW:'#0d7a54' };

const NAV = [
  { id:'dashboard', label:'Dashboard',     Icon: Icons.Dashboard },
  { id:'inbox',     label:'Inbox',         Icon: Icons.Inbox     },
  { id:'tasks',     label:'Tasks',         Icon: Icons.Tasks     },
  { id:'habits',    label:'Habits',        Icon: Icons.Habits    },
  { id:'reading',   label:'Reading',       Icon: Icons.Reading   },
  { id:'review',    label:'Weekly Review', Icon: Icons.Review    },
];

function getGreeting(name) {
  const h = new Date().getHours();
  const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return `${g}, ${name}! 👋`;
}

/* ── Atoms ── */
function Cb({ done, onToggle }) {
  return (
    <div className={`cb${done?' done':''}`} onClick={e => { e.stopPropagation(); onToggle(); }}>
      {done && <Icons.Check />}
    </div>
  );
}
function PrioDot({ prio }) {
  return <span style={{ width:6, height:6, borderRadius:'50%', background:PRIO[prio]||PRIO.LOW, display:'inline-block', flexShrink:0 }} />;
}
function CatDot({ cat, size=8 }) {
  const c = CAT[cat] || { ink:'#a08060' };
  return <span style={{ width:size, height:size, borderRadius:'50%', background:c.ink, display:'inline-block', flexShrink:0 }} />;
}
function CatPill({ cat }) {
  const c = CAT[cat] || { ink:'#a08060', wash:'#f5ede0', name:'Other' };
  return <span style={{ background:c.wash, color:c.ink, borderRadius:6, fontSize:11, fontWeight:500, padding:'2px 7px', border:`1px solid ${c.ink}22` }}>{c.name}</span>;
}

/* ── Sidebar ── */
function Sidebar({ active, setActive, collapsed, onToggleCollapse }) {
  return (
    <aside className={`sidebar${collapsed?' collapsed':''}`}>
      <div className="sidebar-logo" style={{ cursor:'default' }}>
        <div className="sidebar-logo-row">
          <span className="sidebar-logo-icon">✦</span>
          <span className="sidebar-logo-text">ADHD Life</span>
          {!collapsed && (
            <button onClick={onToggleCollapse} title="Collapse sidebar"
              style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'var(--text-faint)', padding:2, display:'flex', lineHeight:1 }}>
              <Icons.Collapse />
            </button>
          )}
        </div>
        <p className="sidebar-user">Erva</p>
      </div>
      <nav className="sidebar-nav">
        {NAV.map(({ id, label, Icon }) => (
          <button key={id} className={`nav-item${active===id?' active':''}`}
            onClick={() => setActive(id)} title={collapsed ? label : undefined}>
            <Icon /><span className="nav-label">{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        {collapsed && (
          <button onClick={onToggleCollapse} title="Expand sidebar"
            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-faint)', padding:'8px', display:'flex', justifyContent:'center', width:'100%' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        )}
        <button className={`nav-item${active==='settings'?' active':''}`}
          onClick={() => setActive('settings')} title={collapsed ? 'Settings' : undefined}>
          <Icons.Settings /><span className="nav-label">Settings</span>
        </button>
      </div>
    </aside>
  );
}

/* ── Bottom nav (mobile) ── */
function BottomNav({ active, setActive }) {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {NAV.slice(0,5).map(({ id, label, Icon }) => (
          <button key={id} className={`bottom-tab${active===id?' active':''}`} onClick={() => setActive(id)}>
            <Icon /><span className="bottom-tab-label">{label.split(' ')[0]}</span>
          </button>
        ))}
        <button className={`bottom-tab${active==='settings'?' active':''}`} onClick={() => setActive('settings')}>
          <Icons.Settings /><span className="bottom-tab-label">Settings</span>
        </button>
      </div>
    </nav>
  );
}

Object.assign(window, { Icons, CAT, PRIO, NAV, getGreeting, Cb, PrioDot, CatDot, CatPill, Sidebar, BottomNav });
