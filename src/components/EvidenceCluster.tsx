import Link from 'next/link'
import type { ClusterGroup } from '@/lib/evidence'
import { UNSOURCED_LABEL, UNSOURCED_DESCRIPTION, UNSOURCED_COLOUR } from '@/lib/evidence'
import { EvidenceBadge, UnsourcedBadge } from './EvidenceBadge'

function MethodologyLink() {
  return (
    <Link
      href="/archive#methodology"
      style={{
        display: 'block', marginTop: '12px', paddingTop: '10px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        fontFamily: 'var(--font-dm-mono)', fontSize: '10px', letterSpacing: '0.5px',
        color: '#5c5a57', textDecoration: 'underline', textUnderlineOffset: '2px',
      }}
    >
      How we source this →
    </Link>
  )
}

// Pure CSS hover/focus — no client JS. The panel is a sibling of the trigger button inside
// a `.group` wrapper, visible only while the pointer or focus is somewhere inside that one
// wrapper (group-hover / group-focus-within). This makes it physically impossible for a panel
// to get stuck open when the cursor moves to a different icon, and avoids a client component
// (and its own state/effects/listeners) per spec row.
//
// The panel sits flush against the trigger (top: 100%, no gap) and extends all the way down
// through the card below — the "breathing room" above the card is padding-top on this same
// element, not an outside margin. That makes the hoverable region one unbroken shape from icon
// to card, so moving the cursor into the card never crosses a dead zone that would drop the
// hover and close the panel prematurely.
function IconWithPanel({ trigger, panelTitle, panelColour, children }: {
  trigger: React.ReactNode
  panelTitle: string
  panelColour: string
  children: React.ReactNode
}) {
  return (
    <div className="group" style={{ position: 'relative' }}>
      <button
        type="button"
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', lineHeight: 0 }}
        aria-label={panelTitle}
      >
        {trigger}
      </button>

      <div
        className="invisible opacity-0 pointer-events-none group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-opacity duration-100"
        style={{ position: 'absolute', top: '100%', right: 0, zIndex: 40, paddingTop: '10px', width: '270px' }}
      >
        <div style={{
          background: '#161616', border: '1px solid rgba(255,255,255,0.12)',
          padding: '14px', boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
        }}>
          <div style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '10px', letterSpacing: '1.5px',
            textTransform: 'uppercase', color: panelColour, marginBottom: '10px',
          }}>
            {panelTitle}
          </div>
          {children}
          <MethodologyLink />
        </div>
      </div>
    </div>
  )
}

export function EvidenceCluster({ groups }: { groups: ClusterGroup[] }) {
  if (groups.length === 0) {
    return (
      <IconWithPanel trigger={<UnsourcedBadge />} panelTitle={UNSOURCED_LABEL} panelColour={UNSOURCED_COLOUR}>
        <p style={{ fontSize: '12px', color: '#9e9b96', lineHeight: 1.6 }}>{UNSOURCED_DESCRIPTION}</p>
      </IconWithPanel>
    )
  }

  return (
    <div style={{ display: 'inline-flex', gap: '4px' }}>
      {groups.map(g => (
        <IconWithPanel
          key={g.evidenceType.id}
          trigger={<EvidenceBadge evidenceType={g.evidenceType} count={g.count} />}
          panelTitle={g.evidenceType.label}
          panelColour={g.evidenceType.colour}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {g.lines.map(line => (
              <div key={line.key}>
                {line.excerpt && (
                  <p style={{ fontSize: '12px', color: '#9e9b96', lineHeight: 1.5, fontStyle: 'italic', marginBottom: '4px' }}>
                    &ldquo;{line.excerpt}&rdquo;
                  </p>
                )}
                {line.href ? (
                  <Link
                    href={line.href}
                    style={{ fontSize: '11px', color: '#c8a96e', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                  >
                    {line.label} →
                  </Link>
                ) : (
                  <p style={{ fontSize: '11px', color: '#5c5a57' }}>{line.label}</p>
                )}
              </div>
            ))}
          </div>
        </IconWithPanel>
      ))}
    </div>
  )
}
