import Link from 'next/link'
import type { Guitar } from '@/lib/types'

interface Props {
  guitar: Guitar
}

function formatMgrId(id: number) {
  return `MGR-${String(id).padStart(4, '0')}`
}

function ConfidenceBadge({ source }: { source: string | null }) {
  if (!source) return null
  const map: Record<string, { label: string; color: string; bg: string }> = {
    'Catalogue Confirmed': { label: 'Catalogue', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
    'Press Confirmed':     { label: 'Press',      color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
    'Owner Confirmed':     { label: 'Owner',      color: '#c084fc', bg: 'rgba(192,132,252,0.1)' },
    'Registry Derived':    { label: 'Registry',   color: '#c8a96e', bg: 'rgba(200,169,110,0.12)' },
    'Unverified':          { label: 'Unverified', color: '#5c5a57', bg: 'rgba(255,255,255,0.04)' },
  }
  const entry = map[source]
  if (!entry) return null
  return (
    <span style={{
      fontSize: '11px',
      fontFamily: 'var(--font-dm-mono)',
      color: entry.color,
      background: entry.bg,
      padding: '2px 8px',
      letterSpacing: '0.3px',
    }}>
      {entry.label}
    </span>
  )
}

export default function GuitarCard({ guitar }: Props) {
  return (
    <Link
      href={`/guitar/${guitar.mgr_id}`}
      style={{
        display: 'block',
        background: '#161616',
        border: '1px solid rgba(255,255,255,0.08)',
        textDecoration: 'none',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,169,110,0.4)')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)')}
    >
      {/* Image */}
      <div style={{ aspectRatio: '1', background: '#1e1e1e', position: 'relative', overflow: 'hidden' }}>
        {guitar.primary_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={guitar.primary_image_url}
            alt={`${guitar.model ?? 'Guitar'} ${guitar.serial ?? ''}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#2a2a2a', fontSize: '3rem', fontFamily: 'var(--font-dm-mono)',
          }}>
            ♦
          </div>
        )}
        <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
          <span style={{
            background: 'rgba(14,14,14,0.85)',
            color: '#9e9b96',
            fontSize: '11px',
            fontFamily: 'var(--font-dm-mono)',
            padding: '3px 8px',
            letterSpacing: '0.5px',
          }}>
            {formatMgrId(guitar.mgr_id)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
          <p style={{ color: '#f0ede8', fontSize: '14px', fontWeight: 500 }}>
            {guitar.model ?? 'Unknown model'}
          </p>
          {guitar.generation && (
            <span style={{ color: '#5c5a57', fontSize: '11px', fontFamily: 'var(--font-dm-mono)', whiteSpace: 'nowrap' }}>
              {guitar.generation}
            </span>
          )}
        </div>

        {guitar.serial && (
          <p style={{ color: '#5c5a57', fontSize: '11px', fontFamily: 'var(--font-dm-mono)', marginBottom: '8px' }}>
            {guitar.serial}
          </p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
          {guitar.factory_colour && (
            <span style={{
              fontSize: '11px',
              color: '#9e9b96',
              background: 'rgba(255,255,255,0.04)',
              padding: '2px 8px',
              fontFamily: 'var(--font-dm-mono)',
            }}>
              {guitar.factory_colour.split(' — ')[0]}
            </span>
          )}
          <ConfidenceBadge source={guitar.specification_source} />
        </div>

        {(guitar.last_known_city || guitar.last_known_country) && (
          <p style={{ color: '#5c5a57', fontSize: '11px', marginTop: '8px' }}>
            {[guitar.last_known_city, guitar.last_known_country].filter(Boolean).join(', ')}
          </p>
        )}
      </div>
    </Link>
  )
}
