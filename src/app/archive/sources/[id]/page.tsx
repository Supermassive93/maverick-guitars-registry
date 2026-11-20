import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { SourceMaterial } from '@/lib/types'

export const revalidate = 60

async function getOrderedSources(): Promise<SourceMaterial[]> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('source_materials')
    .select('*')
    .eq('is_published', true)
    .order('year', { ascending: true, nullsFirst: false })
  return (data ?? []) as SourceMaterial[]
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: dataRaw } = await supabase.from('source_materials').select('title, description').eq('id', id).single()
  const data = dataRaw as Pick<SourceMaterial, 'title' | 'description'> | null
  if (!data) return { title: 'Source Not Found — Maverick Guitars Registry' }
  return {
    title: `${data.title} — Source Archive — Maverick Guitars Registry`,
    description: data.description ?? `Primary source material from the Maverick Guitars Registry archive.`,
  }
}

const navLinkStyle: React.CSSProperties = {
  fontSize: '13px', fontFamily: 'var(--font-dm-mono)', letterSpacing: '0.5px',
}

type SourceImage = { id: string; page_number: number | null; image_url: string; caption: string | null }

export default async function SourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  // The detail page resolves by id regardless of is_published, so a citation link to an
  // unpublished source still works — only the Archive listing and prev/next cycle skip it.
  const [{ data: sourceRaw }, { data: imagesRaw }] = await Promise.all([
    supabase.from('source_materials').select('*').eq('id', id).single(),
    supabase.from('source_material_images').select('*').eq('source_material_id', id).order('page_number', { ascending: true, nullsFirst: false }),
  ])
  if (!sourceRaw) notFound()
  const source = sourceRaw as SourceMaterial
  const images = (imagesRaw ?? []) as SourceImage[]

  const ordered = await getOrderedSources()
  const currentIndex = ordered.findIndex(s => s.id === id)
  const prevSource = currentIndex > 0 ? ordered[currentIndex - 1] : null
  const nextSource = currentIndex >= 0 && currentIndex < ordered.length - 1 ? ordered[currentIndex + 1] : null

  const citationLine = [source.title, source.source_credit].filter(Boolean).join(' — ')

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

      {/* Source navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ flex: 1 }}>
          {prevSource ? (
            <Link href={`/archive/sources/${prevSource.id}`} className="link-muted" style={navLinkStyle}>
              ← Previous Source ({prevSource.year ?? '—'})
            </Link>
          ) : <span />}
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <Link href="/archive#source-archive" className="link-muted" style={navLinkStyle}>
            ↑ Return to Source Archive
          </Link>
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          {nextSource ? (
            <Link href={`/archive/sources/${nextSource.id}`} className="link-muted" style={navLinkStyle}>
              Next Source ({nextSource.year ?? '—'}) →
            </Link>
          ) : <span />}
        </div>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{
          display: 'inline-block',
          fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
          color: '#8b6e3f', background: 'rgba(200,169,110,0.08)', padding: '3px 9px', marginBottom: '14px',
        }}>
          {source.material_type}{source.year ? ` · ${source.year}` : ''}
        </div>
        <h1 style={{
          fontFamily: 'var(--font-bebas)', fontSize: 'clamp(2.4rem, 6vw, 4rem)',
          letterSpacing: '2px', lineHeight: 1.05, color: '#f0ede8',
        }}>
          {source.title}
        </h1>
        {source.description && (
          <p style={{ color: '#9e9b96', fontSize: '15px', lineHeight: 1.7, maxWidth: '680px', marginTop: '16px' }}>
            {source.description}
          </p>
        )}
      </div>

      {/* Metadata table */}
      <div style={{ marginBottom: '40px', border: '1px solid rgba(255,255,255,0.08)' }}>
        {[
          ['Title', source.title],
          ['Type', source.material_type],
          ['Year', source.year ?? 'Undated'],
          ['Pages', source.page_count != null ? String(source.page_count) : null],
          ['Credit', source.source_credit],
          ['Cite as', citationLine || null],
        ].filter(([, value]) => value).map(([label, value]) => (
          <div key={label} style={{ display: 'flex', gap: '16px', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }}>
            <span style={{ color: '#5c5a57', width: '110px', flexShrink: 0, fontFamily: 'var(--font-dm-mono)', fontSize: '11px' }}>{label}</span>
            <span style={{ color: '#f0ede8' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Copyright / fair use disclaimer — draft wording, pending review */}
      <div style={{
        marginBottom: '40px', padding: '1.25rem 1.5rem',
        background: 'rgba(200,169,110,0.04)', borderLeft: '3px solid rgba(200,169,110,0.3)',
      }}>
        <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#8b6e3f', lineHeight: 1.7 }}>
          This material is reproduced here for research, archival, and historical documentation purposes only.
          All rights remain with the original publisher or copyright holder. No commercial use of this material
          is intended. If you are the rights holder and have concerns about its use here, please{' '}
          <Link href="/contribute" style={{ color: '#c8a96e', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
            contact the archive
          </Link>.
        </p>
      </div>

      {/* Full source text */}
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#3a3835', marginBottom: '16px' }}>
          Source Text
        </p>
        {source.extracted_text ? (
          <div className="source-text-body" style={{ color: '#c8c5c0', fontSize: '14px', lineHeight: 1.75 }}>
            <ReactMarkdown>{source.extracted_text}</ReactMarkdown>
          </div>
        ) : (
          <div style={{ border: '1px dashed rgba(255,255,255,0.12)', padding: '2rem', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#5c5a57', lineHeight: 1.7 }}>
              The full text of this source hasn&apos;t been transcribed into the archive yet.
              Individual cited facts from this source are still linked correctly from model pages.
            </p>
          </div>
        )}
      </div>

      {/* Images */}
      {images.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#3a3835', marginBottom: '16px' }}>
            Images
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1px',
            background: 'rgba(255,255,255,0.06)',
          }}>
            {images.map(img => (
              <a
                key={img.id}
                href={img.image_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block', background: '#161616' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.image_url}
                  alt={img.caption ?? `${source.title}${img.page_number ? ` — page ${img.page_number}` : ''}`}
                  style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ padding: '8px 10px', fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: '#5c5a57' }}>
                  {img.caption ?? (img.page_number ? `Page ${img.page_number}` : 'Reference photo')}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {source.file_url && (
        <div style={{ marginBottom: '20px' }}>
          <a
            href={source.file_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
              color: '#c8a96e', textDecoration: 'none',
              borderBottom: '1px solid rgba(200,169,110,0.3)', paddingBottom: '2px',
            }}
          >
            View original file →
          </a>
        </div>
      )}
    </div>
  )
}
