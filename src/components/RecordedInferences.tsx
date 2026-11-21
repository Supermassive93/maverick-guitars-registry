import { monoLabel } from '@/lib/text-styles'
import type { ClusterGroup, EvidenceTypeMap } from '@/lib/evidence'
import { EvidenceCluster } from '@/components/EvidenceCluster'

export type InferenceRow = {
  id: string
  inference_number: number
  title: string
  explanation: string
  updated_at: string
  inference_sources: {
    note: string | null
    source_type: string
    source_materials: { id: string; title: string; year: string | null } | null
  }[]
}

// Select string for the `inferences` table — shared with the archive page's query.
export const INFERENCE_SELECT = 'id, inference_number, title, explanation, updated_at, inference_sources(note, source_type, source_materials(id, title, year))'

// Each linked source keeps its own real evidence type (manufacturer documentation, press
// quote, photography, ...) rather than one generic icon — grouped the same way a field's
// citations are grouped elsewhere, so a source cited for its photography shows differently
// from one cited for its text.
function sourcesCluster(inf: InferenceRow, evidenceTypes: EvidenceTypeMap): ClusterGroup[] {
  const buckets = new Map<string, typeof inf.inference_sources>()
  for (const is of inf.inference_sources) {
    if (!is.source_materials) continue
    const list = buckets.get(is.source_type) ?? []
    list.push(is)
    buckets.set(is.source_type, list)
  }
  return [...buckets.entries()]
    .map((entry): ClusterGroup | null => {
      const [sourceType, rows] = entry
      const evidenceType = evidenceTypes[sourceType]
      if (!evidenceType) return null
      return {
        evidenceType,
        count: rows.length,
        lines: rows.map(is => ({
          key: is.source_materials!.id,
          label: `${is.source_materials!.title}${is.source_materials!.year ? ` (${is.source_materials!.year})` : ''}`,
          href: `/archive/sources/${is.source_materials!.id}`,
          excerpt: is.note,
        })),
      }
    })
    .filter((g): g is ClusterGroup => g !== null)
    .sort((a, b) => a.evidenceType.strength_rank - b.evidenceType.strength_rank)
}

export function RecordedInferences({ inferences, evidenceTypes }: { inferences: InferenceRow[]; evidenceTypes: EvidenceTypeMap }) {
  return (
    <section id="inferences" style={{ scrollMarginTop: '100px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ padding: '5rem 4rem 3rem' }}>
        <p style={{
          ...monoLabel('11px', '3px'),
          color: '#5c5a57', textTransform: 'uppercase', marginBottom: '16px',
        }}>Reasoned Conclusions</p>
        <h2 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: 'clamp(36px, 5vw, 64px)',
          letterSpacing: '2px', lineHeight: 1,
          color: '#f0ede8', marginBottom: '16px',
        }}>RECORDED INFERENCES</h2>
        <p style={{ maxWidth: '620px', color: '#9e9b96', fontSize: '15px', lineHeight: 1.7 }}>
          Some facts on this site aren&apos;t stated directly anywhere — they&apos;re reasoned from more than one
          piece of evidence. Every spec marked <strong style={{ color: '#f0ede8' }}>Inferred</strong> links here.
          Each entry below sets out the reasoning in full and the sources it draws on.
        </p>
      </div>

      <div style={{ padding: '0 4rem 5rem', display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
        {inferences.length === 0 && (
          <p style={{ background: '#0e0e0e', padding: '3rem', color: '#5c5a57', fontFamily: 'var(--font-dm-mono)', fontSize: '13px' }}>
            No inferences recorded yet.
          </p>
        )}
        {inferences.map(inf => (
          <div key={inf.id} id={`inference-${inf.id}`} style={{ background: '#161616', padding: '2.5rem 3rem', scrollMarginTop: '100px' }}>
            <h3 style={{
              fontFamily: 'var(--font-bebas)', fontSize: 'clamp(24px, 3vw, 32px)',
              letterSpacing: '1px', lineHeight: 1.1,
              color: '#c8a96e', marginBottom: '14px',
            }}>
              <span style={{ color: '#5c5a57' }}>#{String(inf.inference_number).padStart(6, '0')} : </span>
              {inf.title}
            </h3>

            <p style={{ color: '#9e9b96', fontSize: '14px', lineHeight: 1.75, marginBottom: '20px' }}>
              {inf.explanation}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <EvidenceCluster groups={sourcesCluster(inf, evidenceTypes)} align="left" />
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: '#3a3835', letterSpacing: '0.5px' }}>
                Last modified {new Date(inf.updated_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
