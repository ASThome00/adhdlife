import { useState, useEffect } from 'react'
import { check, type Update, type DownloadEvent } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
import { getVersion } from '@tauri-apps/api/app'
import { RefreshCw, CheckCircle2, Download, RotateCcw, AlertCircle } from 'lucide-react'

type UpdateState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'up-to-date' }
  | { status: 'available'; version: string; notes: string | null; update: Update }
  | { status: 'downloading'; progress: number }
  | { status: 'ready' }
  | { status: 'error'; message: string }

const MUTED: React.CSSProperties = { fontFamily: 'inherit', fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }

export function UpdaterCard() {
  const [appVersion, setAppVersion] = useState<string>('')
  const [state, setState] = useState<UpdateState>({ status: 'idle' })

  useEffect(() => {
    getVersion().then(setAppVersion).catch(() => setAppVersion('unknown'))
  }, [])

  async function handleCheck() {
    setState({ status: 'checking' })
    try {
      const update = await check()
      if (update) setState({ status: 'available', version: update.version, notes: update.body ?? null, update })
      else setState({ status: 'up-to-date' })
    } catch (e) {
      setState({ status: 'error', message: e instanceof Error ? e.message : 'Could not check for updates.' })
    }
  }

  async function handleInstall() {
    if (state.status !== 'available') return
    const { update } = state
    setState({ status: 'downloading', progress: 0 })
    try {
      let downloaded = 0
      let total = 0
      await update.download((event: DownloadEvent) => {
        if (event.event === 'Started') total = event.data.contentLength ?? 0
        else if (event.event === 'Progress') {
          downloaded += event.data.chunkLength
          setState({ status: 'downloading', progress: total > 0 ? Math.round((downloaded / total) * 100) : 0 })
        } else if (event.event === 'Finished') setState({ status: 'ready' })
      })
      await update.install()
      setState({ status: 'ready' })
    } catch (e) {
      setState({ status: 'error', message: e instanceof Error ? e.message : 'Download failed.' })
    }
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div className="card-title" style={{ marginBottom: 2 }}>Updates</div>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--text-mono)' }}>
            Version {appVersion || '…'}
          </div>
        </div>

        {state.status === 'idle' && (
          <button onClick={handleCheck} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <RefreshCw size={14} /> Check for updates
          </button>
        )}
        {state.status === 'checking' && <div style={MUTED}><RefreshCw size={14} className="animate-spin" /> Checking…</div>}
        {state.status === 'up-to-date' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ ...MUTED, color: '#0d7a54' }}><CheckCircle2 size={14} /> Up to date</span>
            <button onClick={handleCheck} className="btn-ghost">check again</button>
          </div>
        )}
        {state.status === 'ready' && (
          <button onClick={() => relaunch()} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <RotateCcw size={14} /> Restart to install
          </button>
        )}
        {state.status === 'error' && (
          <button onClick={handleCheck} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={13} /> retry
          </button>
        )}
      </div>

      {state.status === 'available' && (
        <div className="card-lite" style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <span style={{ fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: 'var(--text-accent)' }}>
              Version {state.version} available
            </span>
            <button onClick={handleInstall} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Download size={14} /> Download &amp; install
            </button>
          </div>
          {state.notes && (
            <p style={{ fontFamily: 'inherit', fontSize: 12.5, color: 'var(--text-body)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
              {state.notes}
            </p>
          )}
        </div>
      )}

      {state.status === 'downloading' && (
        <div style={{ marginTop: 14 }}>
          <div style={{ ...MUTED, justifyContent: 'space-between', marginBottom: 6 }}>
            <span>Downloading update…</span>
            <span style={{ fontFamily: 'DM Mono, monospace' }}>{state.progress}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--bg-card-lite)', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${state.progress}%`, background: 'var(--accent)', borderRadius: 4, transition: 'width 0.2s' }} />
          </div>
        </div>
      )}

      {state.status === 'error' && (
        <div style={{ ...MUTED, marginTop: 12, alignItems: 'flex-start' }}>
          <AlertCircle size={14} style={{ marginTop: 2, flexShrink: 0 }} />
          <span>{state.message}</span>
        </div>
      )}
    </div>
  )
}
