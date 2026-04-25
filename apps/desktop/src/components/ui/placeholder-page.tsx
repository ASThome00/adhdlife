export function PlaceholderPage({ label }: { label: string }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 12,
        padding: 24,
      }}
    >
      <div
        style={{
          fontFamily: 'Lora, serif',
          fontSize: 32,
          fontStyle: 'italic',
          fontWeight: 500,
          color: 'var(--border)',
        }}
      >
        ✦
      </div>
      <div
        style={{
          fontFamily: 'Lora, serif',
          fontStyle: 'italic',
          fontSize: 18,
          color: 'var(--text-faint)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'Geist, sans-serif',
          fontSize: 13,
          color: 'var(--text-mono)',
        }}
      >
        Coming soon — dashboard first.
      </div>
    </div>
  )
}
