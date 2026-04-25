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

export function SettingsPage() {
  const [appVersion, setAppVersion] = useState<string>('')
  const [state, setState] = useState<UpdateState>({ status: 'idle' })

  useEffect(() => {
    getVersion().then(setAppVersion).catch(() => setAppVersion('unknown'))
  }, [])

  async function handleCheck() {
    setState({ status: 'checking' })
    try {
      const update = await check()
      if (update) {
        setState({ status: 'available', version: update.version, notes: update.body ?? null, update })
      } else {
        setState({ status: 'up-to-date' })
      }
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
        if (event.event === 'Started') {
          total = event.data.contentLength ?? 0
        } else if (event.event === 'Progress') {
          downloaded += event.data.chunkLength
          setState({ status: 'downloading', progress: total > 0 ? Math.round((downloaded / total) * 100) : 0 })
        } else if (event.event === 'Finished') {
          setState({ status: 'ready' })
        }
      })
      await update.install()
      setState({ status: 'ready' })
    } catch (e) {
      setState({ status: 'error', message: e instanceof Error ? e.message : 'Download failed.' })
    }
  }

  async function handleRelaunch() {
    await relaunch()
  }

  return (
    <div className="scroll-panel h-full">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <h1 className="text-2xl font-semibold text-stone-800">Settings</h1>

        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-medium text-stone-800">Updates</h2>
              <p className="text-sm text-stone-400 mt-0.5">
                Version {appVersion || '…'}
              </p>
            </div>

            {state.status === 'idle' && (
              <button onClick={handleCheck} className="btn-primary flex items-center gap-2 text-sm">
                <RefreshCw className="w-4 h-4" />
                Check for Updates
              </button>
            )}

            {state.status === 'checking' && (
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Checking…
              </div>
            )}

            {state.status === 'up-to-date' && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  You're up to date
                </div>
                <button onClick={handleCheck} className="btn-ghost text-xs text-stone-400">
                  Check again
                </button>
              </div>
            )}

            {state.status === 'ready' && (
              <button onClick={handleRelaunch} className="btn-primary flex items-center gap-2 text-sm">
                <RotateCcw className="w-4 h-4" />
                Restart to Install
              </button>
            )}

            {state.status === 'error' && (
              <button onClick={handleCheck} className="btn-ghost text-sm text-stone-500 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            )}
          </div>

          {state.status === 'available' && (
            <div className="border border-violet-100 rounded-xl bg-violet-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-violet-800">
                  Version {state.version} available
                </span>
                <button
                  onClick={handleInstall}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download &amp; Install
                </button>
              </div>
              {state.notes && (
                <p className="text-sm text-violet-700 whitespace-pre-line leading-relaxed">
                  {state.notes}
                </p>
              )}
            </div>
          )}

          {state.status === 'downloading' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-stone-500">
                <span>Downloading update…</span>
                <span>{state.progress}%</span>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all duration-200"
                  style={{ width: `${state.progress}%` }}
                />
              </div>
            </div>
          )}

          {state.status === 'error' && (
            <div className="flex items-start gap-2 text-sm text-stone-500">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-stone-400" />
              <span>{state.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
