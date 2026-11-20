import type { EvidenceType } from '@/lib/evidence'
import { EvidenceIcon } from '@/lib/evidence-icons'

// Relative luminance (WCAG formula) — used to pick a readable icon colour against a solid
// fill automatically, rather than hardcoding white. Keeps badges legible no matter what
// colour a type is set to, including light ones like dayglo yellow.
function relativeLuminance(hex: string): number {
  const channels = hex.replace('#', '').match(/.{2}/g)
  if (!channels) return 0
  const [r, g, b] = channels.map(c => {
    const v = parseInt(c, 16) / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const COUNT_BADGE_STYLE: React.CSSProperties = {
  position: 'absolute', top: '-5px', right: '-6px',
  minWidth: '13px', height: '13px', padding: '0 2px',
  borderRadius: '7px', background: '#161616', border: '1px solid rgba(255,255,255,0.18)',
  color: '#f0ede8', fontSize: '9px', fontFamily: 'var(--font-dm-mono)',
  lineHeight: '11px', textAlign: 'center',
}

export function EvidenceBadge({ evidenceType, count, size = 20 }: {
  evidenceType: EvidenceType
  count?: number
  size?: number
}) {
  const isSolid = evidenceType.style === 'solid'
  const iconColour = isSolid
    ? (relativeLuminance(evidenceType.colour) > 0.5 ? '#141414' : '#fff')
    : evidenceType.colour
  return (
    <span
      aria-label={evidenceType.label}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: `${size}px`, height: `${size}px`, borderRadius: '50%',
        flexShrink: 0, position: 'relative',
        background: isSolid ? evidenceType.colour : 'transparent',
        border: isSolid ? 'none' : `1.5px solid ${evidenceType.colour}`,
        color: iconColour,
      }}
    >
      <EvidenceIcon name={evidenceType.icon} size={Math.round(size * 0.55)} />
      {count != null && count > 1 && <span style={COUNT_BADGE_STYLE}>{count}</span>}
    </span>
  )
}

// No citations at all for a field — dashed grey ring with a question mark
export function UnsourcedBadge({ size = 20 }: { size?: number }) {
  return (
    <span
      aria-label="Unsourced"
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: `${size}px`, height: `${size}px`, borderRadius: '50%',
        flexShrink: 0,
        border: '1.5px dashed rgba(255,255,255,0.25)',
        color: '#5c5a57',
      }}
    >
      <EvidenceIcon name="question-mark" size={Math.round(size * 0.55)} />
    </span>
  )
}
