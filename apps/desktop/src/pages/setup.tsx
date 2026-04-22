// apps/desktop/src/pages/setup.tsx
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { updateSettings } from '@/lib/queries/settings'
import { qk } from '@/lib/hooks/use-data'

export function SetupPage() {
  const [name, setName]       = useState('')
  const [loading, setLoading] = useState(false)
  const qc = useQueryClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await updateSettings({ display_name: name.trim(), setup_complete: true })
    // Refetch settings — App.tsx will redirect to dashboard
    await qc.invalidateQueries({ queryKey: qk.settings })
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center h-screen bg-surface-50 select-text">
      <div className="w-full max-w-sm text-center space-y-8 px-4">

        {/* Logo */}
        <div>
          <div className="text-5xl mb-3">✦</div>
          <h1 className="text-3xl font-bold text-gray-900">ADHD Life</h1>
          <p className="text-gray-400 mt-2 text-sm leading-relaxed">
            A calm place for your brain.<br />
            Everything stays on your computer.
          </p>
        </div>

        {/* Card */}
        <div className="card text-left space-y-5">
          <div>
            <p className="text-gray-700 font-semibold">What should I call you?</p>
            <p className="text-xs text-gray-400 mt-0.5">Just for your morning greeting.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              autoFocus
              type="text"
              placeholder="Your name or nickname"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={40}
              className="w-full text-center text-lg px-4 py-3 rounded-xl
                         border border-surface-200 bg-surface-50
                         focus:outline-none focus:ring-2 focus:ring-primary-400
                         focus:border-transparent placeholder:text-gray-300
                         select-text"
            />
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? 'Setting up…' : "Let's go →"}
            </button>
          </form>
        </div>

        <p className="text-xs text-gray-300">
          No cloud. No sync. No account needed.
        </p>
      </div>
    </div>
  )
}
