import { useState } from 'react'

const MESSAGES = [
  "Progress, not perfection. You're doing great. ✨",
  'One thing at a time — that\'s the whole secret. 🌿',
  'Every small step is still a step forward. 💜',
]

export function MotivationQuote() {
  const [msg] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)])
  return (
    <div
      style={{
        background: 'var(--acc-note)',
        border: '1.5px solid var(--acc-note-border)',
        borderRadius: 10,
        padding: '10px 16px',
        boxShadow: '2px 2.5px 0px var(--acc-note-shadow)',
        fontFamily: 'Lora, serif',
        fontStyle: 'italic',
        fontSize: 13,
        color: 'var(--acc-note-text)',
        lineHeight: 1.6,
      }}
    >
      {msg}
    </div>
  )
}
