
/* ── Inbox page — Phase 3 brain dump ── */

const INBOX_ITEMS = [
  { id:1, title:'Research grants for second year', cat: null, assigned: false },
  { id:2, title:'Figure out gym membership situation', cat: null, assigned: false },
  { id:3, title:'Email grandma back', cat:'social', assigned: true },
];

function InboxPage() {
  const [dumpText, setDumpText] = React.useState('');
  const [items, setItems] = React.useState(INBOX_ITEMS);
  const [submitted, setSubmitted] = React.useState(false);
  const textRef = React.useRef();

  function handleDump() {
    if (!dumpText.trim()) return;
    const lines = dumpText.split('\n').filter(l => l.trim());
    const newItems = lines.map((l, i) => ({ id: Date.now() + i, title: l.trim(), cat: null, assigned: false }));
    setItems(prev => [...newItems, ...prev]);
    setDumpText('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  }

  function assignCat(id, cat) {
    setItems(items => items.map(i => i.id === id ? { ...i, cat, assigned: true } : i));
  }
  function removeItem(id) {
    setItems(items => items.filter(i => i.id !== id));
  }

  return (
    <>
      <header className="topbar">
        <h1 style={{ fontFamily:'Lora,serif', fontStyle:'italic', fontSize:19, fontWeight:600, color:'var(--text-primary)', letterSpacing:'-0.02em' }}>
          Inbox
        </h1>
        <span style={{ fontFamily:'DM Mono,monospace', fontSize:12, color:'var(--text-mono)' }}>{items.length} items</span>
      </header>

      <div className="content-scroll">
        <div style={{ maxWidth:640 }}>

          {/* Brain dump area */}
          <div className="card" style={{ marginBottom:20 }}>
            <div className="card-title"><span>🧠</span> Brain dump</div>
            <p style={{ fontFamily:'Lora,serif', fontStyle:'italic', fontSize:13, color:'var(--text-muted)', marginBottom:12, lineHeight:1.6 }}>
              Get it out of your head. One thought per line — sorting can happen later.
            </p>
            <textarea
              ref={textRef}
              value={dumpText}
              onChange={e => setDumpText(e.target.value)}
              placeholder={"What's swirling around in your brain right now?\n\nOne thought per line is fine.\nOr write everything in one go.\nWe'll sort it out together."}
              onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleDump(); }}
              style={{
                width:'100%', minHeight:120, resize:'vertical',
                fontFamily:'Geist,sans-serif', fontSize:14, lineHeight:1.7,
                color:'var(--text-body)', background:'var(--bg-card-lite)',
                border:'1.5px solid var(--input-border)', borderRadius:10,
                padding:'12px 14px', outline:'none', transition:'border-color 0.2s',
                userSelect:'text', WebkitUserSelect:'text',
              }}
              onFocus={e => e.target.style.borderColor = '#c9566e'}
              onBlur={e => e.target.style.borderColor = 'var(--input-border)'}
            />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10 }}>
              <span style={{ fontFamily:'Geist,sans-serif', fontSize:11, color:'var(--text-faint)' }}>
                {navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'}+Enter to dump
              </span>
              <button
                onClick={handleDump}
                disabled={!dumpText.trim()}
                style={{
                  background: dumpText.trim() ? '#c9566e' : 'var(--bg-card-lite)',
                  border: `2px solid ${dumpText.trim() ? '#96334d' : 'var(--border)'}`,
                  borderRadius:9, boxShadow: dumpText.trim() ? '2px 2.5px 0px #96334d' : 'none',
                  color: dumpText.trim() ? 'white' : 'var(--text-faint)',
                  fontFamily:'Geist,sans-serif', fontSize:13, fontWeight:600,
                  padding:'8px 20px', cursor: dumpText.trim() ? 'pointer' : 'not-allowed',
                  transition:'all 0.15s',
                }}>
                {submitted ? 'Dumped ✓' : 'Dump it'}
              </button>
            </div>
          </div>

          {/* Inbox list */}
          {items.length > 0 && (
            <div>
              <div style={{ fontFamily:'Geist,sans-serif', fontSize:11, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-mono)', marginBottom:10 }}>
                To sort
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {items.map(item => (
                  <div key={item.id} style={{
                    display:'flex', alignItems:'center', gap:10, padding:'12px 14px',
                    background:'var(--bg-card)', border:'1.5px solid var(--border)',
                    borderRadius:10, boxShadow:'2px 2.5px 0 var(--shadow)',
                  }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:'Geist,sans-serif', fontSize:13.5, fontWeight:500, color:'var(--text-body)' }}>{item.title}</div>
                      {/* Category assign */}
                      <div style={{ display:'flex', gap:5, marginTop:8, flexWrap:'wrap' }}>
                        {Object.entries(CAT).map(([k,c]) => (
                          <button key={k} onClick={() => assignCat(item.id, k)}
                            style={{
                              padding:'2px 8px', borderRadius:6, fontSize:11, cursor:'pointer',
                              border:`1.5px solid ${item.cat===k ? c.ink : c.ink+'33'}`,
                              background: item.cat===k ? c.wash : 'transparent',
                              color: item.cat===k ? c.ink : 'var(--text-faint)',
                              fontFamily:'Geist,sans-serif', fontWeight: item.cat===k ? 600 : 400,
                              transition:'all 0.1s',
                            }}>
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.id)}
                      style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-faint)', padding:4, flexShrink:0, lineHeight:1 }}
                      title="Drop it">
                      <Icons.Close />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {items.length === 0 && (
            <div style={{ textAlign:'center', padding:'40px 0', fontFamily:'Lora,serif', fontStyle:'italic', fontSize:15, color:'var(--text-faint)' }}>
              All clear. Enjoy the quiet. 🌿
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Tasks page stub ── */
function TasksPage() {
  const cats = Object.entries(CAT);
  const [selCat, setSelCat] = React.useState(null);

  const allTasks = [
    { id:1, title:'Reply to thesis supervisor email', cat:'school', prio:'HIGH',   due:'Today',     status:'ACTIVE' },
    { id:2, title:'Refill prescription at pharmacy',  cat:'health', prio:'MEDIUM', due:'Today',     status:'ACTIVE' },
    { id:3, title:'Review Q2 budget spreadsheet',     cat:'work',   prio:'MEDIUM', due:'Today',     status:'DONE'   },
    { id:4, title:'Call insurance about claim',       cat:'admin',  prio:'HIGH',   due:'3 days ago',status:'ACTIVE' },
    { id:5, title:'Order birthday gift for Mom',      cat:'social', prio:'MEDIUM', due:'Yesterday', status:'ACTIVE' },
    { id:6, title:'Start Chapter 4 outline',          cat:'school', prio:'HIGH',   due:'Tomorrow',  status:'ACTIVE' },
    { id:7, title:'Grocery run',                      cat:'home',   prio:'LOW',    due:'This week', status:'ACTIVE' },
    { id:8, title:'Schedule annual checkup',          cat:'health', prio:'LOW',    due:'Someday',   status:'ACTIVE' },
  ];
  const [tasks, setTasks] = React.useState(allTasks);
  const filtered = selCat ? tasks.filter(t => t.cat === selCat) : tasks;
  const toggle = id => setTasks(ts => ts.map(t => t.id===id ? {...t, status: t.status==='DONE'?'ACTIVE':'DONE'} : t));

  return (
    <>
      <header className="topbar">
        <h1 style={{ fontFamily:'Lora,serif', fontStyle:'italic', fontSize:19, fontWeight:600, color:'var(--text-primary)', letterSpacing:'-0.02em' }}>Tasks</h1>
        <span style={{ fontFamily:'DM Mono,monospace', fontSize:12, color:'var(--text-mono)' }}>{tasks.filter(t=>t.status!=='DONE').length} active</span>
      </header>
      <div className="content-scroll">
        <div style={{ display:'flex', gap:16, maxWidth:900 }}>
          {/* Category sidebar */}
          <div style={{ width:160, flexShrink:0 }}>
            <div style={{ fontFamily:'Geist,sans-serif', fontSize:11, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-mono)', marginBottom:8 }}>Categories</div>
            <button onClick={() => setSelCat(null)}
              style={{ width:'100%', textAlign:'left', padding:'7px 10px', borderRadius:8, border:'none', background: !selCat ? 'var(--nav-active-bg)' : 'transparent', color: !selCat ? 'var(--nav-active-fg)' : 'var(--text-sidebar)', fontFamily:'Geist,sans-serif', fontSize:13, fontWeight: !selCat ? 600 : 400, cursor:'pointer', marginBottom:2 }}>
              All tasks
            </button>
            {cats.map(([k,c]) => {
              const count = tasks.filter(t => t.cat===k && t.status!=='DONE').length;
              return (
                <button key={k} onClick={() => setSelCat(k===selCat?null:k)}
                  style={{ width:'100%', textAlign:'left', padding:'7px 10px', borderRadius:8, border:'none',
                    background: selCat===k ? c.wash : 'transparent', color: selCat===k ? c.ink : 'var(--text-sidebar)',
                    fontFamily:'Geist,sans-serif', fontSize:13, fontWeight: selCat===k ? 600 : 400,
                    cursor:'pointer', marginBottom:2, display:'flex', alignItems:'center', gap:7 }}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background:c.ink, flexShrink:0 }}/>
                  {c.name}
                  {count > 0 && <span style={{ marginLeft:'auto', fontFamily:'DM Mono,monospace', fontSize:10, color:'var(--text-faint)' }}>{count}</span>}
                </button>
              );
            })}
          </div>

          {/* Task list */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {filtered.map(t => (
                <div key={t.id} className="task-row" style={{ opacity: t.status==='DONE' ? 0.45 : 1 }}
                  onClick={() => toggle(t.id)}>
                  <Cb done={t.status==='DONE'} onToggle={() => toggle(t.id)} />
                  <PrioDot prio={t.prio} />
                  <span className={`task-title${t.status==='DONE'?' done':''}`}>{t.title}</span>
                  <span style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'var(--text-faint)', whiteSpace:'nowrap' }}>{t.due}</span>
                  <CatPill cat={t.cat} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Habits page stub ── */
function HabitsPage() {
  const HABITS_DATA = [
    { id:1, name:'Morning walk',   color:'#0d7a54', streak:12, longest:24, history:[1,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,0,1] },
    { id:2, name:'Journaling',     color:'#96334d', streak:7,  longest:14, history:[0,1,1,1,1,0,0,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1] },
    { id:3, name:'Vitamins',       color:'#b34040', streak:3,  longest:11, history:[1,0,1,1,0,0,1,0,1,1,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0,1,1,1,0] },
    { id:4, name:'Read 20 min',    color:'#9d1f6e', streak:21, longest:21, history:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1] },
  ];
  const [habits, setHabits] = React.useState(HABITS_DATA);
  const [newName, setNewName] = React.useState('');

  return (
    <>
      <header className="topbar">
        <h1 style={{ fontFamily:'Lora,serif', fontStyle:'italic', fontSize:19, fontWeight:600, color:'var(--text-primary)', letterSpacing:'-0.02em' }}>Habits</h1>
      </header>
      <div className="content-scroll">
        <div style={{ maxWidth:720 }}>
          {habits.map(h => (
            <div key={h.id} className="card" style={{ marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ width:10, height:10, borderRadius:'50%', background:h.color, display:'inline-block' }}/>
                  <span style={{ fontFamily:'Lora,serif', fontWeight:600, fontSize:15, color:'var(--text-primary)' }}>{h.name}</span>
                </div>
                <div style={{ display:'flex', gap:20 }}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontFamily:'DM Mono,monospace', fontSize:18, fontWeight:500, color: h.streak > 0 ? '#c9566e' : 'var(--text-faint)' }}>{h.streak}</div>
                    <div style={{ fontFamily:'Geist,sans-serif', fontSize:10, color:'var(--text-mono)' }}>current</div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontFamily:'DM Mono,monospace', fontSize:18, fontWeight:500, color:'var(--text-muted)' }}>{h.longest}</div>
                    <div style={{ fontFamily:'Geist,sans-serif', fontSize:10, color:'var(--text-mono)' }}>longest</div>
                  </div>
                </div>
              </div>
              {/* 30-day dot grid */}
              <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                {h.history.map((done, i) => (
                  <div key={i} style={{
                    width:18, height:18, borderRadius:4,
                    background: done ? h.color + 'cc' : 'var(--bg-card-lite)',
                    border: `1px solid ${done ? h.color + '44' : 'var(--border)'}`,
                    transition:'all 0.15s',
                  }} title={`Day ${i+1}`}/>
                ))}
              </div>
            </div>
          ))}

          {/* Add new habit */}
          <div className="card" style={{ padding:'16px 20px' }}>
            <div style={{ fontFamily:'Lora,serif', fontWeight:600, fontSize:13, color:'var(--text-primary)', marginBottom:10 }}>+ New habit</div>
            <div style={{ display:'flex', gap:8 }}>
              <input value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Habit name…"
                style={{ flex:1, fontFamily:'Geist,sans-serif', fontSize:13, color:'var(--text-body)', background:'var(--bg-card-lite)', border:'1.5px solid var(--input-border)', borderRadius:8, padding:'8px 12px', outline:'none', userSelect:'text', WebkitUserSelect:'text' }}
                onFocus={e => e.target.style.borderColor='#c9566e'}
                onBlur={e => e.target.style.borderColor='var(--input-border)'}
              />
              <button
                style={{ background:'#c9566e', border:'2px solid #96334d', borderRadius:9, boxShadow:'2px 2.5px 0 #96334d', color:'white', fontFamily:'Geist,sans-serif', fontSize:13, fontWeight:600, padding:'7px 16px', cursor:'pointer' }}
                onClick={() => { if (!newName.trim()) return; setHabits(hs => [...hs, { id:Date.now(), name:newName.trim(), color:'#c9566e', streak:0, longest:0, history:[] }]); setNewName(''); }}>
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Reading page stub ── */
function ReadingPage() {
  const BOOKS = {
    reading: [{ id:1, title:'When Breath Becomes Air', author:'Paul Kalanithi', pages:256, current:178, genre:'Memoir' }],
    toRead:  [{ id:2, title:"The Body Keeps the Score", author:'Bessel van der Kolk', pages:464, current:0, genre:'Psychology' }, { id:3, title:'Atomic Habits', author:'James Clear', pages:320, current:0, genre:'Self-help' }],
    done:    [{ id:4, title:'Becoming', author:'Michelle Obama', pages:448, current:448, rating:5, genre:'Memoir' }],
  };
  const cols = [
    { key:'toRead',  label:'To Read',   emoji:'📚' },
    { key:'reading', label:'Reading',   emoji:'📖' },
    { key:'done',    label:'Finished',  emoji:'✅' },
  ];
  return (
    <>
      <header className="topbar">
        <h1 style={{ fontFamily:'Lora,serif', fontStyle:'italic', fontSize:19, fontWeight:600, color:'var(--text-primary)', letterSpacing:'-0.02em' }}>Reading</h1>
      </header>
      <div className="content-scroll">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, maxWidth:860 }}>
          {cols.map(col => (
            <div key={col.key}>
              <div style={{ fontFamily:'Geist,sans-serif', fontSize:11, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-mono)', marginBottom:10 }}>
                {col.emoji} {col.label}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {BOOKS[col.key].map(b => (
                  <div key={b.id} className="card" style={{ padding:'14px 16px' }}>
                    <div style={{ fontFamily:'Lora,serif', fontWeight:600, fontSize:14, color:'var(--text-primary)', marginBottom:4 }}>{b.title}</div>
                    <div style={{ fontFamily:'Geist,sans-serif', fontSize:12, color:'var(--text-muted)', marginBottom:8 }}>{b.author}</div>
                    {col.key === 'reading' && (
                      <>
                        <div style={{ height:4, background:'var(--bg-card-lite)', borderRadius:2, border:'1px solid var(--border)', overflow:'hidden', marginBottom:4 }}>
                          <div style={{ height:'100%', width:`${Math.round(b.current/b.pages*100)}%`, background:'#c9566e', borderRadius:2, transition:'width 0.4s' }}/>
                        </div>
                        <div style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'var(--text-muted)' }}>p. {b.current} / {b.pages}</div>
                      </>
                    )}
                    {col.key === 'done' && b.rating && (
                      <div style={{ fontSize:12 }}>{'★'.repeat(b.rating)}{'☆'.repeat(5-b.rating)}</div>
                    )}
                    <div style={{ marginTop:6 }}><CatPill cat="reading" /></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── Review page stub ── */
function ReviewPage() {
  return (
    <>
      <header className="topbar">
        <h1 style={{ fontFamily:'Lora,serif', fontStyle:'italic', fontSize:19, fontWeight:600, color:'var(--text-primary)', letterSpacing:'-0.02em' }}>Weekly Review</h1>
        <span style={{ fontFamily:'DM Mono,monospace', fontSize:12, color:'var(--text-mono)' }}>Apr 18 – Apr 24</span>
      </header>
      <div className="content-scroll">
        <div style={{ maxWidth:680, display:'flex', flexDirection:'column', gap:16 }}>
          {/* Stats row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {[{label:'Tasks done', val:'12', sub:'of 18 planned', color:'#0d7a54'},{label:'Habit avg', val:'74%', sub:'across 4 habits', color:'#c9566e'},{label:'Brain dumps', val:'3', sub:'items cleared', color:'#2563a8'}].map(s => (
              <div key={s.label} className="card" style={{ padding:'16px', textAlign:'center' }}>
                <div style={{ fontFamily:'DM Mono,monospace', fontSize:26, fontWeight:500, color:s.color }}>{s.val}</div>
                <div style={{ fontFamily:'Lora,serif', fontWeight:600, fontSize:13, color:'var(--text-primary)', marginTop:4 }}>{s.label}</div>
                <div style={{ fontFamily:'Geist,sans-serif', fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Carried forward */}
          <div className="card">
            <div className="card-title"><span>🔄</span> Carried forward</div>
            {['Call insurance about claim', 'Order birthday gift for Mom', 'Schedule annual checkup'].map((t,i) => (
              <div key={i} className="task-row">
                <PrioDot prio={i===0?'HIGH':'MEDIUM'} />
                <span className="task-title">{t}</span>
              </div>
            ))}
          </div>

          {/* Next week priorities */}
          <div className="card">
            <div className="card-title"><span>🎯</span> Top 3 priorities next week</div>
            {[1,2,3].map(n => (
              <div key={n} style={{ display:'flex', gap:10, alignItems:'center', marginBottom:n<3?10:0 }}>
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:12, color:'var(--text-accent)', fontWeight:600, width:16 }}>{n}.</span>
                <input placeholder={`Priority ${n}…`}
                  style={{ flex:1, fontFamily:'Geist,sans-serif', fontSize:13.5, color:'var(--text-body)', background:'var(--bg-card-lite)', border:'1.5px solid var(--input-border)', borderRadius:8, padding:'8px 12px', outline:'none', userSelect:'text', WebkitUserSelect:'text' }}
                  onFocus={e => e.target.style.borderColor='#c9566e'}
                  onBlur={e => e.target.style.borderColor='var(--input-border)'}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Settings page stub ── */
function SettingsPage({ dark, onToggleDark }) {
  const [name, setName] = React.useState('Erva');
  const [focusLimit, setFocusLimit] = React.useState(5);

  return (
    <>
      <header className="topbar">
        <h1 style={{ fontFamily:'Lora,serif', fontStyle:'italic', fontSize:19, fontWeight:600, color:'var(--text-primary)', letterSpacing:'-0.02em' }}>Settings</h1>
      </header>
      <div className="content-scroll">
        <div style={{ maxWidth:520 }}>
          {/* Profile */}
          <div className="card" style={{ marginBottom:16 }}>
            <div className="card-title"><span>👤</span> Profile</div>
            <label style={{ display:'block', fontFamily:'Geist,sans-serif', fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>Display name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              style={{ fontFamily:'Geist,sans-serif', fontSize:14, color:'var(--text-body)', background:'var(--bg-card-lite)', border:'1.5px solid var(--input-border)', borderRadius:8, padding:'9px 12px', outline:'none', width:'100%', userSelect:'text', WebkitUserSelect:'text' }}
              onFocus={e => e.target.style.borderColor='#c9566e'}
              onBlur={e => e.target.style.borderColor='var(--input-border)'}
            />
          </div>

          {/* Appearance */}
          <div className="card" style={{ marginBottom:16 }}>
            <div className="card-title"><span>🎨</span> Appearance</div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div>
                <div style={{ fontFamily:'Geist,sans-serif', fontSize:13, color:'var(--text-body)', fontWeight:500 }}>Dark mode</div>
                <div style={{ fontFamily:'Geist,sans-serif', fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Easier on the eyes at night</div>
              </div>
              <button className={`toggle-sw${dark?' on':''}`} onClick={onToggleDark} />
            </div>
          </div>

          {/* Focus */}
          <div className="card">
            <div className="card-title"><span>⚡</span> Daily focus limit</div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <input type="number" value={focusLimit} min={1} max={20} onChange={e => setFocusLimit(+e.target.value)}
                style={{ width:72, fontFamily:'DM Mono,monospace', fontSize:20, textAlign:'center', color:'#c9566e', background:'var(--bg-card-lite)', border:'1.5px solid var(--input-border)', borderRadius:8, padding:'8px', outline:'none', userSelect:'text', WebkitUserSelect:'text' }}
                onFocus={e => e.target.style.borderColor='#c9566e'}
                onBlur={e => e.target.style.borderColor='var(--input-border)'}
              />
              <span style={{ fontFamily:'Geist,sans-serif', fontSize:13, color:'var(--text-muted)' }}>tasks per day maximum</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { InboxPage, TasksPage, HabitsPage, ReadingPage, ReviewPage, SettingsPage });
