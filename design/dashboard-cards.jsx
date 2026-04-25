
/* ── Dashboard card components ── */

const INIT_FOCUS = [
  { id:1, title:'Reply to thesis supervisor email', cat:'school', prio:'HIGH',   done:false },
  { id:2, title:'Refill prescription at pharmacy',  cat:'health', prio:'MEDIUM', done:false },
  { id:3, title:'Review Q2 budget spreadsheet',     cat:'work',   prio:'MEDIUM', done:true  },
];
const INIT_HABITS = [
  { id:1, icon:'🚶', name:'Morning walk', streak:12, done:true  },
  { id:2, icon:'📓', name:'Journaling',   streak:7,  done:true  },
  { id:3, icon:'💊', name:'Vitamins',     streak:3,  done:false },
  { id:4, icon:'📖', name:'Read 20 min',  streak:21, done:false },
];
const INIT_CARRIED = [
  { id:10, title:'Call insurance about claim',  cat:'admin',  prio:'HIGH',   daysAgo:3, done:false },
  { id:11, title:'Order birthday gift for Mom', cat:'social', prio:'MEDIUM', daysAgo:1, done:false },
];
const UPCOMING = [
  { id:20, title:'Team standup',        cat:'work',   time:'11:00 AM' },
  { id:21, title:'Dentist appointment', cat:'health', time:'3:30 PM'  },
];
const MOTIVATION_MSGS = [
  "Progress, not perfection. You're doing great. ✨",
  "One thing at a time — that's the whole secret. 🌿",
  "Every small step is still a step forward. 💜",
];

/* ── FocusTasksCard ── */
function FocusTasksCard({ compact, onAddTask }) {
  const [tasks, setTasks] = React.useState(INIT_FOCUS);
  const doneCount = tasks.filter(t => t.done).length;
  const toggle = id => setTasks(ts => ts.map(t => t.id === id ? {...t, done: !t.done} : t));

  return (
    <div className="card" style={{ padding: compact ? '14px 16px' : '20px 22px' }}>
      <div className="card-title">
        <span aria-hidden="true">⚡</span> Focus tasks
        <span className="card-title-mono">{doneCount}/{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <p style={{ fontFamily:'Lora,serif', fontStyle:'italic', fontSize:13, color:'var(--text-mono)', padding:'12px 4px', lineHeight:1.5 }}>
          No focus tasks yet — pick a few from your task list, or add one below.
        </p>
      ) : tasks.map(t => (
        <div key={t.id} className="task-row" style={{ opacity: t.done ? 0.42 : 1 }}
          onClick={() => !t.done && toggle(t.id)}>
          <Cb done={t.done} onToggle={() => toggle(t.id)} />
          <PrioDot prio={t.prio} />
          <span className={`task-title${t.done ? ' done' : ''}`}>{t.title}</span>
          <CatDot cat={t.cat} />
        </div>
      ))}

      <button
        onClick={() => onAddTask({ isFocus: true })}
        style={{
          marginTop:10, width:'100%', padding:'7px',
          border:'1.5px dashed var(--border)', borderRadius:8, background:'transparent',
          fontFamily:'Lora,serif', fontStyle:'italic', fontSize:12, color:'var(--text-mono)',
          cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5,
          transition:'all 0.12s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor='#c9566e'; e.currentTarget.style.color='var(--text-accent)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-mono)'; }}
      >
        + add a task
      </button>
    </div>
  );
}

/* ── HabitsCard ── */
function HabitsCard({ compact }) {
  const [habits, setHabits] = React.useState(INIT_HABITS);
  const toggle = id => setHabits(hs => hs.map(h => h.id === id ? {...h, done: !h.done} : h));

  return (
    <div className="card" style={{ padding: compact ? '14px 16px' : '20px 22px' }}>
      <div className="card-title"><span aria-hidden="true">🌱</span> Today's habits</div>

      {habits.length === 0 ? (
        <p style={{ fontFamily:'Lora,serif', fontStyle:'italic', fontSize:13, color:'var(--text-mono)', padding:'8px 4px' }}>
          No habits yet — add your first one in the Habits tab.
        </p>
      ) : (
        <div style={{ display:'flex', justifyContent:'space-between', gap:8, alignItems:'flex-start' }}>
          {habits.slice(0,6).map(h => (
            <button key={h.id} type="button"
              onClick={() => toggle(h.id)}
              aria-label={`${h.name}, ${h.done ? 'done' : 'not done'} today`}
              style={{ textAlign:'center', flex:1, background:'transparent', border:'none', cursor:'pointer', padding:0, display:'flex', flexDirection:'column', alignItems:'center' }}>
              <div className={`hcircle${h.done ? ' done' : ''}`} style={{ margin:'0 auto' }}>
                {h.done ? <Icons.Check /> : (
                  <span style={{ fontSize:18 }}>{h.icon}</span>
                )}
              </div>
              <div style={{ fontFamily:'Geist,sans-serif', fontSize:11, color:'var(--text-muted)', marginTop:6, fontWeight:500, maxWidth:72, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {h.name}
              </div>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:10, color: h.done ? 'var(--text-accent)' : 'var(--text-faint)', marginTop:2 }}>
                🔥 {h.streak}d
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── MotivationQuote ── */
function MotivationQuote() {
  const [msg] = React.useState(() => MOTIVATION_MSGS[Math.floor(Math.random() * MOTIVATION_MSGS.length)]);
  return (
    <div style={{
      background:'var(--acc-note)', border:'1.5px solid var(--acc-note-border)', borderRadius:10,
      padding:'10px 16px', boxShadow:'2px 2.5px 0px var(--acc-note-shadow)',
      fontFamily:'Lora,serif', fontStyle:'italic', fontSize:13, color:'var(--acc-note-text)', lineHeight:1.6,
    }}>
      {msg}
    </div>
  );
}

/* ── CarriedOverAccordion ── */
function CarriedOverAccordion({ compact }) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState(INIT_CARRIED);
  const toggle = id => setItems(is => is.map(i => i.id === id ? {...i, done: !i.done} : i));

  if (items.length === 0) return null;

  return (
    <div className="card" style={{ padding:0, overflow:'hidden' }}>
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open}
        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
          padding: compact ? '12px 16px' : '15px 20px',
          background:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span aria-hidden="true" style={{ fontSize:14 }}>📋</span>
          <span style={{ fontFamily:'Lora,serif', fontWeight:600, fontSize:14, color:'var(--text-primary)' }}>
            Carried over
          </span>
          <span style={{ background:'var(--bg-accent)', color:'var(--text-accent)', borderRadius:99,
            fontFamily:'DM Mono,monospace', fontSize:11, fontWeight:500,
            padding:'1px 8px', border:'1px solid var(--pill-border)' }}>
            {items.length}
          </span>
        </div>
        <Icons.Chevron open={open} />
      </button>

      <div className={`acc-body${open ? ' open' : ''}`}>
        <div style={{ padding:'0 20px 16px' }}>
          <p style={{ fontFamily:'Lora,serif', fontStyle:'italic', fontSize:12, color:'var(--text-mono)', marginBottom:10 }}>
            These wandered over from earlier — no rush, just keeping them visible. ✨
          </p>
          {items.map(item => (
            <div key={item.id} onClick={() => !item.done && toggle(item.id)}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:8,
                marginBottom:6, background:'var(--bg-card-lite)', border:'1px solid var(--border)',
                cursor:'pointer', opacity: item.done ? 0.42 : 1 }}>
              <Cb done={item.done} onToggle={() => toggle(item.id)} />
              <PrioDot prio={item.prio} />
              <span style={{ flex:1, fontFamily:'Geist,sans-serif', fontSize:13, color:'var(--text-body)',
                fontWeight:500, textDecoration: item.done ? 'line-through' : 'none',
                textDecorationColor:'var(--text-faint)' }}>
                {item.title}
              </span>
              <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'var(--text-faint)' }}>{item.daysAgo}d ago</span>
              <CatDot cat={item.cat} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── UpcomingCard ── */
function UpcomingCard({ compact }) {
  return (
    <div className="card" style={{ padding: compact ? '14px 16px' : '20px 22px' }}>
      <div className="card-title"><span aria-hidden="true">📅</span> Upcoming today</div>
      {UPCOMING.length === 0 ? (
        <p style={{ fontFamily:'Lora,serif', fontStyle:'italic', fontSize:13, color:'var(--text-mono)', padding:'8px 4px' }}>
          Nothing else on the books. Enjoy the space.
        </p>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {UPCOMING.map(u => {
            const c = CAT[u.cat] || { ink:'#a08060', wash:'#f5ede0', name:'Other' };
            return (
              <div key={u.id} className="card-lite" style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px' }}>
                <div style={{ width:3, height:32, borderRadius:2, background:c.ink, flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:'Geist,sans-serif', fontSize:13, fontWeight:500, color:'var(--text-body)',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.title}</div>
                  <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{u.time}</div>
                </div>
                <CatPill cat={u.cat} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── WeekStrip ── */
function WeekStrip() {
  // Build Mon–Sun of the current week
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
  const dayLetters = ['M','T','W','T','F','S','S'];
  const isToday = (d) => d.toDateString() === today.toDateString();

  return (
    <div style={{ display:'flex', gap:5 }}>
      {days.map((d, i) => (
        <div key={i} className={`wday${isToday(d) ? ' today' : ''}`}>
          <span style={{ fontFamily:'Geist,sans-serif', fontSize:9, fontWeight:600,
            color: isToday(d) ? 'rgba(255,255,255,0.85)' : 'var(--text-mono)' }}>
            {dayLetters[i]}
          </span>
          <span style={{ fontFamily:'DM Mono,monospace', fontSize:11,
            color: isToday(d) ? 'white' : 'var(--text-sidebar)',
            fontWeight: isToday(d) ? 700 : 400 }}>
            {d.getDate()}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Full DashboardPage ── */
function DashboardPage({ compact, serifHeaders, showMotivation, dark, onToggleDark, onOpenModal }) {
  const today = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });

  // Compute completion counts from focus tasks state
  const doneCount = 3; // 1 done in focus + 2 habits
  const totalCount = 6;

  return (
    <>
      {/* Topbar */}
      <header className="topbar">
        <div style={{ minWidth:0 }}>
          <h1 style={{
            fontFamily: serifHeaders ? 'Lora,serif' : 'Geist,sans-serif',
            fontStyle: serifHeaders ? 'italic' : 'normal',
            fontSize:19, fontWeight:600, color:'var(--text-primary)', letterSpacing:'-0.02em',
          }}>
            {getGreeting('Erva')}
          </h1>
          <p style={{ fontFamily:'Geist,sans-serif', fontSize:12, color:'var(--text-muted)', marginTop:1 }}>{today}</p>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          <button className="theme-toggle" onClick={onToggleDark}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
            {dark ? '☀️' : '🌙'}
          </button>
          <div style={{
            background:'var(--bg-accent)', border:'1.5px solid var(--pill-border)', borderRadius:8,
            padding:'7px 14px', boxShadow:'2px 2.5px 0px var(--shadow-accent)',
            fontFamily:'Geist,sans-serif', fontSize:13, color:'var(--text-accent)', fontWeight:600,
            display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap',
          }}>
            <span style={{ fontFamily:'DM Mono,monospace' }}>{doneCount} of {totalCount}</span>
            <span style={{ fontWeight:400, color:'var(--text-accent2)' }}>done today</span>
            <span>✓</span>
          </div>
        </div>
      </header>

      {/* Grid */}
      <div className="content-scroll">
        <div className="dash-grid">
          {/* Left column */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <FocusTasksCard compact={compact} onAddTask={onOpenModal} />
            <HabitsCard compact={compact} />
            {showMotivation && <MotivationQuote />}
          </div>
          {/* Right column */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <CarriedOverAccordion compact={compact} />
            <UpcomingCard compact={compact} />
            <WeekStrip />
          </div>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { DashboardPage });
