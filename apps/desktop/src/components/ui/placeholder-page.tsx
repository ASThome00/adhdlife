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
          fontSize: 32,
          fontWeight: 500,
          color: 'var(--border)',
        }}
      >
        ✦
      </div>
      <div
        style={{
          fontSize: 18,
          color: 'var(--text-faint)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          color: 'var(--text-mono)',
        }}
      >
        Coming soon — dashboard first.
      </div>
    </div>
  )
}
