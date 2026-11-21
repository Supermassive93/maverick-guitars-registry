import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Metadata } from 'next'
import type { SourceMaterial } from '@/lib/types'
import Link from 'next/link'
import { getEvidenceTypes, UNSOURCED_LABEL, UNSOURCED_DESCRIPTION } from '@/lib/evidence'
import { EvidenceBadge, UnsourcedBadge } from '@/components/EvidenceBadge'
import { monoLabel } from '@/lib/text-styles'
import { RecordedInferences, INFERENCE_SELECT, type InferenceRow } from '@/components/RecordedInferences'

export const metadata: Metadata = {
  title: 'Archive — Maverick Guitars Registry',
  description: 'Company history, the primary source archive, how we cite evidence, and the reasoned conclusions behind the specs.',
}

const subNav = [
  { href: '#history', label: 'Company History' },
  { href: '#source-archive', label: 'Source Archive' },
  { href: '#methodology', label: 'Methodology' },
  { href: '#inferences', label: 'Recorded Inferences' },
]

export default async function ArchivePage() {
  const supabase = await createSupabaseServerClient()

  const [{ data: materialsRaw }, { data: inferencesRaw }, evidenceTypes] = await Promise.all([
    supabase.from('source_materials').select('*').eq('is_published', true).order('year', { ascending: true, nullsFirst: false }),
    supabase.from('inferences').select(INFERENCE_SELECT).order('inference_number', { ascending: true }),
    getEvidenceTypes(),
  ])
  const materials = materialsRaw as SourceMaterial[] | null
  const inferences = (inferencesRaw ?? []) as unknown as InferenceRow[]
  const evidenceTypeList = Object.values(evidenceTypes).sort((a, b) => a.strength_rank - b.strength_rank)

  return (
    <>
      {/* Page header */}
      <section style={{
        padding: '6rem 4rem 4rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(255,255,255,0.02) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(255,255,255,0.02) 60px)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative' }}>
          <p style={{
            ...monoLabel('11px', '3px'),
            color: '#c8a96e', textTransform: 'uppercase', marginBottom: '16px',
          }}>Archive</p>
          <h1 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(52px, 7vw, 96px)',
            letterSpacing: '3px', lineHeight: 0.92,
            color: '#f0ede8', marginBottom: '24px',
          }}>THE STORY</h1>
          <p style={{ maxWidth: '600px', color: '#9e9b96', fontSize: '16px', lineHeight: 1.7 }}>
            Primary sources, company history, and community knowledge gathered to document the Maverick Guitars story.
            Everything here is built from evidence — catalogue scans, press material, and accounts from people who were there.
          </p>
        </div>
      </section>

      {/* Sticky section sub-nav */}
      <div style={{
        position: 'sticky', top: '56px', zIndex: 50,
        background: 'rgba(14,14,14,0.97)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', gap: '0',
      }}>
        {subNav.map(item => (
          <a key={item.href} href={item.href} className="subnav-link">
            {item.label}
          </a>
        ))}
      </div>

      {/* ── SECTION 1: HISTORY ── */}
      <section id="history" style={{ scrollMarginTop: '100px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ padding: '5rem 4rem 3rem' }}>
          <p style={{
            ...monoLabel('11px', '3px'),
            color: '#5c5a57', textTransform: 'uppercase', marginBottom: '16px',
          }}>Company History</p>
          <h2 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(36px, 5vw, 64px)',
            letterSpacing: '2px', lineHeight: 1,
            color: '#f0ede8', marginBottom: '48px',
          }}>THE MAVERICK STORY</h2>
        </div>

        <div style={{
          padding: '0 4rem 3rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '48px 56px',
        }}>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-bebas)', fontSize: '28px', letterSpacing: '2px',
              color: '#c8a96e', marginBottom: '16px',
            }}>ORIGIN</h3>
            <p style={{ color: '#9e9b96', fontSize: '15px', lineHeight: 1.8, marginBottom: '16px' }}>
              Maverick Guitar Company was a British guitar brand active from approximately 1998 to 2006. The guitars were designed in the UK and manufactured in Korea — a model common to many European brands of the era that allowed British design direction with Korean production quality and pricing.
            </p>
            <p style={{ color: '#9e9b96', fontSize: '15px', lineHeight: 1.8 }}>
              The brand was built around a collaboration with Trev Wilkinson — one of the UK&apos;s most respected hardware designers, whose name appears on bridges, tuners, roller nuts and locking hardware found on instruments from manufacturers across Europe, Japan and Korea. The Wilkinson hardware DNA runs through the Maverick range at every level, from the Floyd Rose-licensed tremolos to the roller pots and Wilkinson-branded fixed bridges that appear across the catalogue.
            </p>
            <p style={{ color: '#9e9b96', fontSize: '15px', lineHeight: 1.8, marginTop: '16px' }}>
              In 1997, hardware designer Trev Wilkinson introduced Maverick Guitars to a small custom workshop in Korea. Recognising the level of hand craftsmanship on offer, Maverick spent the next three years researching what contemporary players needed — and where existing manufacturing fell short. The first guitars reached the market in late 2000.
            </p>
          </div>

          <div>
            <h3 style={{
              fontFamily: 'var(--font-bebas)', fontSize: '28px', letterSpacing: '2px',
              color: '#c8a96e', marginBottom: '16px',
            }}>THE RANGE</h3>
            <p style={{ color: '#9e9b96', fontSize: '15px', lineHeight: 1.8, marginBottom: '16px' }}>
              British-designed and Korean-built, the range spanned 24 models across four catalogue series — featuring the patented Evolution roller volume and tone system as one of several in-house developments that set Maverick apart from the broader market.
            </p>
            <p style={{ color: '#9e9b96', fontSize: '15px', lineHeight: 1.8, marginBottom: '16px' }}>
              Maverick targeted the rock and metal player: players who wanted a serious instrument without paying for a US-made guitar. The F-Series superstrats — the F1, F3 and their variants — formed the commercial backbone of the range, competing directly with similarly-priced Ibanez RG and Jackson Dinky models. The F1 in particular became the guitar most associated with the Maverick name.
            </p>
            <p style={{ color: '#9e9b96', fontSize: '15px', lineHeight: 1.8, marginBottom: '16px' }}>
              Beyond the superstrats, Maverick extended the range into Explorer/Mockingbird-influenced territory with the X-Series, offered a Les Paul-format with the set-neck G-Series, and produced distinctive standalone models including the X-Treme and Matrix. The Streetfighter (SF-1) — a retailer-commissioned limited run with a reverse headstock and fret vents — stands as the rarest production instrument the brand made.
            </p>
            <p style={{ color: '#9e9b96', fontSize: '15px', lineHeight: 1.8 }}>
              Bass guitars appeared in the 2001 catalogue with the B1, followed by the S4 and S5 four and five-string instruments in 2002. The bass range extended the same British design philosophy and Korean manufacturing to the low end.
            </p>
          </div>

          <div>
            <h3 style={{
              fontFamily: 'var(--font-bebas)', fontSize: '28px', letterSpacing: '2px',
              color: '#c8a96e', marginBottom: '16px',
            }}>END OF PRODUCTION</h3>
            <p style={{ color: '#9e9b96', fontSize: '15px', lineHeight: 1.8, marginBottom: '16px' }}>
              Maverick ceased production at some point in the mid-2000s. The exact circumstances — whether through closure, acquisition, or a decision to discontinue the brand — are not fully documented in the archive. The guitars have since become sought-after instruments within the UK collector community, valued for their specification, hardware quality and the relatively short production window that limits supply.
            </p>
            <p style={{ color: '#9e9b96', fontSize: '15px', lineHeight: 1.8 }}>
              This registry exists because Maverick guitars deserve a proper record. If you have information about the brand&apos;s history, production, or the people behind it, the archive wants to hear from you.
            </p>
          </div>
        </div>

        <div style={{ padding: '0 4rem 5rem' }}>
          <div style={{
            padding: '1.5rem 2rem',
            background: 'rgba(200,169,110,0.05)',
            borderLeft: '3px solid rgba(200,169,110,0.3)',
          }}>
            <p style={{
              fontFamily: 'var(--font-dm-mono)', fontSize: '12px',
              color: '#8b6e3f', lineHeight: 1.7,
            }}>
              This account is built from catalogue evidence, physical examples in the registry, and collective knowledge gathered from the Maverick community.
              Where the record is incomplete, it is noted as such rather than filled with speculation.
              If you have information that extends or corrects this history —{' '}
              <Link href="/contribute" style={{ color: '#c8a96e', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                contact the archive
              </Link>.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: SOURCE ARCHIVE ── */}
      <section id="source-archive" style={{ scrollMarginTop: '100px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ padding: '5rem 4rem 3rem' }}>
          <p style={{
            ...monoLabel('11px', '3px'),
            color: '#5c5a57', textTransform: 'uppercase', marginBottom: '16px',
          }}>Primary Sources</p>
          <h2 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(36px, 5vw, 64px)',
            letterSpacing: '2px', lineHeight: 1,
            color: '#f0ede8', marginBottom: '16px',
          }}>SOURCE ARCHIVE</h2>
          <p style={{ maxWidth: '580px', color: '#9e9b96', fontSize: '15px', lineHeight: 1.7, marginBottom: '40px' }}>
            Scanned catalogues, magazine features, advertisements and other primary source material.
            All items are verified against physical originals before publication.
          </p>
        </div>

        <div style={{ padding: '0 4rem 5rem' }}>
          {materials && materials.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1px',
              background: 'rgba(255,255,255,0.06)',
            }}>
              {materials.map(item => (
                <Link
                  key={item.id} id={`source-${item.id}`} href={`/archive/sources/${item.id}`}
                  style={{ display: 'block', background: '#161616', padding: '1.75rem', scrollMarginTop: '100px', textDecoration: 'none' }}
                >
                  {item.thumbnail_url && (
                    <div style={{
                      width: '100%', aspectRatio: '4/3',
                      background: '#111', marginBottom: '1rem',
                      overflow: 'hidden',
                    }}>
                      <img src={item.thumbnail_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{
                    display: 'inline-block',
                    fontFamily: 'var(--font-dm-mono)', fontSize: '10px',
                    letterSpacing: '1.5px', textTransform: 'uppercase',
                    color: '#8b6e3f', background: 'rgba(200,169,110,0.08)',
                    padding: '2px 7px', marginBottom: '10px',
                  }}>
                    {item.material_type}{item.year ? ` · ${item.year}` : ''}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-dm-mono)', fontSize: '14px',
                    color: '#f0ede8', marginBottom: '8px',
                  }}>{item.title}</div>
                  <span style={{
                    display: 'inline-block', marginTop: '16px',
                    fontFamily: 'var(--font-dm-mono)', fontSize: '11px',
                    letterSpacing: '1px', textTransform: 'uppercase',
                    color: '#c8a96e',
                    borderBottom: '1px solid rgba(200,169,110,0.3)',
                    paddingBottom: '2px',
                  }}>
                    View source →
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '4rem', textAlign: 'center',
            }}>
              <p style={{
                fontFamily: 'var(--font-bebas)', fontSize: '32px',
                letterSpacing: '2px', color: '#2a2826', marginBottom: '16px',
              }}>ARCHIVE GROWING</p>
              <p style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '13px',
                color: '#5c5a57', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto',
              }}>
                The 2001 and 2002 catalogues are being professionally digitised and will appear here on receipt.
                Magazine features and press material will follow.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 2.5: METHODOLOGY ── */}
      <section id="methodology" style={{ scrollMarginTop: '100px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ padding: '5rem 4rem 3rem' }}>
          <p style={{
            ...monoLabel('11px', '3px'),
            color: '#5c5a57', textTransform: 'uppercase', marginBottom: '16px',
          }}>How We Source This</p>
          <h2 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(36px, 5vw, 64px)',
            letterSpacing: '2px', lineHeight: 1,
            color: '#f0ede8', marginBottom: '16px',
          }}>METHODOLOGY</h2>
          <p style={{ maxWidth: '620px', color: '#9e9b96', fontSize: '15px', lineHeight: 1.7, marginBottom: '40px' }}>
            Every specification on a model page carries a cluster of small icons showing exactly how we know it.
            Hover or tap any icon to see the citation itself. This is the key.
          </p>
        </div>

        <div style={{ padding: '0 4rem 4rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1px',
            background: 'rgba(255,255,255,0.06)',
            marginBottom: '48px',
          }}>
            {evidenceTypeList.map(et => (
              <div key={et.id} style={{ background: '#161616', padding: '1.5rem', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <EvidenceBadge evidenceType={et} size={22} />
                <div>
                  <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '13px', color: '#f0ede8', marginBottom: '4px' }}>
                    {et.label}
                  </div>
                  <p style={{ fontSize: '12px', color: '#5c5a57', lineHeight: 1.6 }}>{et.description}</p>
                </div>
              </div>
            ))}
            {/* Not a database row — the dashed-ring state shown when a field has no citation at all */}
            <div style={{ background: '#161616', padding: '1.5rem', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <UnsourcedBadge size={22} />
              <div>
                <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '13px', color: '#f0ede8', marginBottom: '4px' }}>
                  {UNSOURCED_LABEL}
                </div>
                <p style={{ fontSize: '12px', color: '#5c5a57', lineHeight: 1.6 }}>{UNSOURCED_DESCRIPTION}</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          padding: '0 4rem 3rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '48px 56px',
        }}>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-bebas)', fontSize: '26px', letterSpacing: '2px',
              color: '#c8a96e', marginBottom: '16px',
            }}>SOLID VS OUTLINE</h3>
            <p style={{ color: '#9e9b96', fontSize: '15px', lineHeight: 1.8 }}>
              A filled, solid icon means the fact is directly attested — stated in a catalogue, visible in a photograph,
              confirmed by an owner, or seen across several registry examples. An outlined icon means the fact is an
              assumption rather than a direct citation: <strong style={{ color: '#f0ede8' }}>Inferred</strong> means it was
              reasoned from other evidence about the same model but not shown or stated directly — where that reasoning
              draws on more than one source, it's written up in full on the{' '}
              <a href="#inferences" style={{ color: '#c8a96e', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                Recorded Inferences
              </a>{' '}
              section below.{' '}
              <strong style={{ color: '#f0ede8' }}>Inherited</strong> means it was carried over from a closely related
              model or variant that shares the part, and has not yet been confirmed for this specific model.
            </p>
          </div>

          <div>
            <h3 style={{
              fontFamily: 'var(--font-bebas)', fontSize: '26px', letterSpacing: '2px',
              color: '#c8a96e', marginBottom: '16px',
            }}>REGISTRY VERIFICATION</h3>
            <p style={{ color: '#9e9b96', fontSize: '15px', lineHeight: 1.8 }}>
              A fact becomes &quot;Registry verified&quot; once it has been confirmed across a minimum number of approved,
              physically inspected guitars in the registry — each one a real submitted instrument, not a catalogue claim.
              The exact threshold is still being decided as the registry grows.
            </p>
          </div>

          <div>
            <h3 style={{
              fontFamily: 'var(--font-bebas)', fontSize: '26px', letterSpacing: '2px',
              color: '#c8a96e', marginBottom: '16px',
            }}>CORRECTIONS</h3>
            <p style={{ color: '#9e9b96', fontSize: '15px', lineHeight: 1.8 }}>
              Every fact on this site is checked against its source before publication, and the archive is never
              treated as finished. When a citation turns out to be wrong, or better evidence comes along, the record
              is corrected and the evidence trail updated — specifications here are a current best answer, not a
              permanent one.
            </p>
          </div>
        </div>

        <div style={{ padding: '0 4rem 5rem' }}>
          <div style={{
            padding: '1.5rem 2rem',
            background: 'rgba(200,169,110,0.05)',
            borderLeft: '3px solid rgba(200,169,110,0.3)',
          }}>
            <p style={{
              fontFamily: 'var(--font-dm-mono)', fontSize: '12px',
              color: '#8b6e3f', lineHeight: 1.7,
            }}>
              Spotted a wrong citation, or have evidence that corrects something here? {' '}
              <Link href="/contribute" style={{ color: '#c8a96e', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                Tell the archive
              </Link>.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 2.75: RECORDED INFERENCES ── */}
      <RecordedInferences inferences={inferences} evidenceTypes={evidenceTypes} />
    </>
  )
}
