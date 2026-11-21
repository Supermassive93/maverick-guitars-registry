import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Metadata } from 'next'
import type { Article } from '@/lib/types'
import Link from 'next/link'
import { monoLabel } from '@/lib/text-styles'

export const metadata: Metadata = {
  title: 'Community — Maverick Guitars Registry',
  description: 'Articles, first-hand accounts and testimonials from the people who made, sold and played Maverick guitars.',
}

export default async function CommunityPage() {
  const supabase = await createSupabaseServerClient()

  const { data: articlesRaw } = await supabase
    .from('articles').select('*').eq('is_published', true).order('published_at', { ascending: false })
  const articles = articlesRaw as Article[] | null

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
          }}>Community</p>
          <h1 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(52px, 7vw, 96px)',
            letterSpacing: '3px', lineHeight: 0.92,
            color: '#f0ede8', marginBottom: '24px',
          }}>THE PEOPLE</h1>
          <p style={{ maxWidth: '600px', color: '#9e9b96', fontSize: '16px', lineHeight: 1.7 }}>
            Written pieces, first-hand accounts and testimonials from the people who made, sold and played Maverick guitars.
          </p>
        </div>
      </section>

      {/* ── ARTICLES & TESTIMONIALS ── */}
      <section id="articles" style={{ scrollMarginTop: '100px' }}>
        <div style={{ padding: '5rem 4rem 3rem' }}>
          <p style={{
            ...monoLabel('11px', '3px'),
            color: '#5c5a57', textTransform: 'uppercase', marginBottom: '16px',
          }}>Community</p>
          <h2 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(36px, 5vw, 64px)',
            letterSpacing: '2px', lineHeight: 1,
            color: '#f0ede8', marginBottom: '16px',
          }}>ARTICLES & TESTIMONIALS</h2>
          <p style={{ maxWidth: '580px', color: '#9e9b96', fontSize: '15px', lineHeight: 1.7, marginBottom: '40px' }}>
            Written pieces, first-hand accounts, and testimonials from the people who made and played these guitars.
            The registry is in contact with former Maverick employees — their accounts will appear here when ready.
          </p>
        </div>

        <div style={{ padding: '0 4rem 5rem' }}>
          {articles && articles.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
              {articles.map(article => (
                <div key={article.id} style={{ background: '#161616', padding: '2rem 2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem', marginBottom: '12px' }}>
                    <div>
                      <div style={{
                        display: 'inline-block',
                        fontFamily: 'var(--font-dm-mono)', fontSize: '10px',
                        letterSpacing: '1.5px', textTransform: 'uppercase',
                        color: '#8b6e3f', background: 'rgba(200,169,110,0.08)',
                        padding: '2px 7px', marginBottom: '10px',
                      }}>{article.article_type}</div>
                      <h3 style={{
                        fontFamily: 'var(--font-bebas)', fontSize: '28px',
                        letterSpacing: '1px', color: '#f0ede8', marginBottom: '4px',
                      }}>{article.title}</h3>
                      {article.author && (
                        <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57' }}>
                          {article.author}
                          {article.published_at && ` · ${new Date(article.published_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })}`}
                        </p>
                      )}
                    </div>
                  </div>
                  {article.excerpt && (
                    <p style={{ fontSize: '14px', color: '#9e9b96', lineHeight: 1.7, maxWidth: '680px' }}>
                      {article.excerpt}
                    </p>
                  )}
                  <a href={`/articles/${article.slug}`} style={{
                    display: 'inline-block', marginTop: '16px',
                    fontFamily: 'var(--font-dm-mono)', fontSize: '11px',
                    letterSpacing: '1px', textTransform: 'uppercase',
                    color: '#c8a96e', textDecoration: 'none',
                    borderBottom: '1px solid rgba(200,169,110,0.3)', paddingBottom: '2px',
                  }}>Read →</a>
                </div>
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
              }}>CONTENT INCOMING</p>
              <p style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '13px',
                color: '#5c5a57', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto 24px',
              }}>
                Articles and testimonials from former Maverick employees and the wider collector community will be posted here.
                If you have a story, experience, or knowledge to share —
              </p>
              <Link href="/contribute" style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '12px',
                letterSpacing: '1px', textTransform: 'uppercase',
                color: '#c8a96e', textDecoration: 'none',
                border: '1px solid rgba(200,169,110,0.35)',
                padding: '10px 20px',
              }}>Get in touch</Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
