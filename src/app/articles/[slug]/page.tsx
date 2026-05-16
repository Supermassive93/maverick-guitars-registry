import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Article } from '@/lib/types'
import Link from 'next/link'

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: articleRaw } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  const article = articleRaw as Article | null
  if (!article) notFound()

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px 96px' }}>
      <div style={{ marginBottom: '40px' }}>
        <Link
          href="/archive#articles"
          style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '11px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            color: '#5c5a57',
            textDecoration: 'none',
          }}
          className="link-muted"
        >
          ← Archive
        </Link>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'inline-block',
          fontFamily: 'var(--font-dm-mono)', fontSize: '10px',
          letterSpacing: '1.5px', textTransform: 'uppercase',
          color: '#8b6e3f', background: 'rgba(200,169,110,0.08)',
          padding: '2px 7px', marginBottom: '16px',
        }}>
          {article.article_type}
        </div>

        <h1 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: 'clamp(36px, 6vw, 56px)',
          letterSpacing: '2px',
          color: '#f0ede8',
          lineHeight: 1.05,
          marginBottom: '16px',
        }}>
          {article.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {article.author && (
            <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#9e9b96' }}>
              {article.author}
            </span>
          )}
          {article.author && article.published_at && (
            <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>
          )}
          {article.published_at && (
            <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#5c5a57' }}>
              {new Date(article.published_at).toLocaleDateString('en-GB', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>

      {article.excerpt && (
        <p style={{
          fontSize: '16px',
          color: '#9e9b96',
          lineHeight: 1.7,
          borderLeft: '2px solid rgba(200,169,110,0.3)',
          paddingLeft: '16px',
          marginBottom: '40px',
          fontStyle: 'italic',
        }}>
          {article.excerpt}
        </p>
      )}

      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingTop: '40px',
        fontSize: '15px',
        color: '#d4d0ca',
        lineHeight: 1.85,
        fontFamily: 'var(--font-dm-sans)',
        whiteSpace: 'pre-wrap',
      }}>
        {article.content}
      </div>

      <div style={{
        marginTop: '64px',
        paddingTop: '24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <Link
          href="/archive#articles"
          style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '11px',
            letterSpacing: '1px', textTransform: 'uppercase',
            color: '#5c5a57', textDecoration: 'none',
          }}
          className="link-muted"
        >
          ← All articles
        </Link>
        <Link
          href="/contribute"
          style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '11px',
            letterSpacing: '1px', textTransform: 'uppercase',
            color: '#5c5a57', textDecoration: 'none',
          }}
          className="link-muted"
        >
          Contribute your story →
        </Link>
      </div>
    </div>
  )
}
