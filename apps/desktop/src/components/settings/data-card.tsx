import { useState } from 'react'
import toast from 'react-hot-toast'
import { exportAllData } from '@/lib/queries/export'

export function DataCard() {
  const [busy, setBusy] = useState(false)

  async function handleExport() {
    setBusy(true)
    try {
      const saved = await exportAllData()
      if (saved) toast.success('Your data is saved!')
    } catch {
      toast.error('Export failed — nothing was written')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card">
      <div className="card-title">Your data</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <p style={{ fontFamily: 'inherit', fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.55, flex: 1 }}>
          Everything lives on this computer. Export a JSON copy anytime — tasks, habits, books, all of it.
        </p>
        <button type="button" className="btn-primary" onClick={handleExport} disabled={busy}>
          {busy ? 'Exporting…' : 'Export my data'}
        </button>
      </div>
    </div>
  )
}
