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

// Visibility is pure CSS hover/focus — no per-instance client JS or React state. The panel is
// a sibling of the trigger button inside a `.group` wrapper, visible only while the pointer or
// focus is somewhere inside that one wrapper (group-hover / group-focus-within). This makes it
// physically impossible for a panel to get stuck open when the cursor moves to a different icon.
// A single document-level listener (EvidencePanelPositioner, mounted once in the root layout)
// separately nudges a panel's horizontal position at hover time if it would overflow the
// viewport — see that file. It only ever sets a transform on the one panel being opened; it
// never touches visibility, so it can't reintroduce the stuck-open bug this avoided above.
//
// The panel sits flush against the trigger (top: 100%, no gap) and extends all the way down
// through the card below — the "breathing room" above the card is padding-top on this same
// element, not an outside margin. That makes the hoverable region one unbroken shape from icon
// to card, so moving the cursor into the card never crosses a dead zone that would drop the
// hover and close the panel prematurely.
// align: which side of the trigger the panel's own edge sticks to, i.e. which way it grows.
// 'right' (the default) suits an icon at the right edge of a wide row — the usual spec-sheet
// case — growing the panel leftward, back over the row. 'left' suits an icon near the left
// edge of its container, growing the panel rightward instead. Either way, the width clamps to
// the viewport so a 270px panel can never force horizontal overflow on a narrow screen.
export function IconWithPanel({ trigger, panelTitle, panelColour, children, align = 'right' }: {
  trigger: React.ReactNode
  panelTitle: string
  panelColour: string
  children: React.ReactNode
  align?: 'left' | 'right'
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
        className="evidence-panel invisible opacity-0 pointer-events-none group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-opacity duration-100"
        style={{
          position: 'absolute', top: '100%', zIndex: 40, paddingTop: '10px',
          width: 'min(270px, calc(100vw - 32px))',
          ...(align === 'right' ? { right: 0 } : { left: 0 }),
        }}
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

export function EvidenceCluster({ groups, align = 'right' }: { groups: ClusterGroup[]; align?: 'left' | 'right' }) {
  if (groups.length === 0) {
    return (
      <IconWithPanel trigger={<UnsourcedBadge />} panelTitle={UNSOURCED_LABEL} panelColour={UNSOURCED_COLOUR} align={align}>
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
          align={align}
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
