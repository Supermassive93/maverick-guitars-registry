'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

const CONTRIBUTION_TYPES = [
  { value: 'Source Material', label: 'Source Material', description: 'Catalogue scans, magazine features, advertisements, photographs' },
  { value: 'Testimonial', label: 'Testimonial', description: 'First-hand account — former employee, retailer, or long-term owner' },
  { value: 'Article', label: 'Article or Write-up', description: 'A longer piece about Maverick history, a model, or your experience' },
  { value: 'Other', label: 'Other', description: 'Anything else that might be useful to the archive' },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#111',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#f0ede8',
  fontFamily: 'var(--font-dm-mono)',
  fontSize: '13px',
  padding: '12px 14px',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-dm-mono)',
  fontSize: '11px',
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  color: '#5c5a57',
  marginBottom: '8px',
}

export default function ContributePage() {
  const [type, setType] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!type || !email || !title) return
    setStatus('submitting')
    setErrorMsg('')

    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.from('contributions').insert({
      name: name || null,
      email,
      contribution_type: type as 'Source Material' | 'Article' | 'Testimonial' | 'Other',
      title,
      description: description || null,
      external_url: url || null,
    })

    if (error) {
      setStatus('error')
      setErrorMsg('Something went wrong — please try again or email the registry directly.')
    } else {
      setStatus('success')
    }
  }

  if (status === 'success') {
    return (
      <section style={{ padding: '8rem 4rem', maxWidth: '640px' }}>
        <p style={{
          fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px',
          color: '#c8a96e', textTransform: 'uppercase', marginBottom: '20px',
        }}>Received</p>
        <h1 style={{
          fontFamily: 'var(--font-bebas)', fontSize: 'clamp(42px, 6vw, 72px)',
          letterSpacing: '3px', lineHeight: 0.95, color: '#f0ede8', marginBottom: '28px',
        }}>THANK YOU</h1>
        <p style={{ color: '#9e9b96', fontSize: '15px', lineHeight: 1.75, marginBottom: '16px' }}>
          Your contribution has been received and will be reviewed by the archive.
          If we need anything more from you, we&apos;ll follow up on the email you provided.
        </p>
        <p style={{ color: '#5c5a57', fontFamily: 'var(--font-dm-mono)', fontSize: '13px', lineHeight: 1.7 }}>
          For physical source material — catalogue copies, press clippings — we&apos;ll be in touch to arrange how to proceed.
        </p>
      </section>
    )
  }

  return (
    <>
      {/* Header */}
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
            fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px',
            color: '#c8a96e', textTransform: 'uppercase', marginBottom: '16px',
          }}>Contribute to the Archive</p>
          <h1 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(52px, 7vw, 88px)',
            letterSpacing: '3px', lineHeight: 0.92,
            color: '#f0ede8', marginBottom: '24px',
          }}>GET IN TOUCH</h1>
          <p style={{ maxWidth: '580px', color: '#9e9b96', fontSize: '16px', lineHeight: 1.7 }}>
            If you have source material, a first-hand account, or something to share with the archive — this is the place.
            All submissions are reviewed before anything is published.
          </p>
        </div>
      </section>

      {/* What we're looking for */}
      <section style={{ padding: '3rem 4rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1px', background: 'rgba(255,255,255,0.06)',
        }}>
          {CONTRIBUTION_TYPES.map(t => (
            <div key={t.value} style={{ background: '#161616', padding: '1.5rem' }}>
              <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '20px', letterSpacing: '1px', color: '#c8a96e', marginBottom: '8px' }}>
                {t.label}
              </div>
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57', lineHeight: 1.6 }}>
                {t.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section style={{ padding: '5rem 4rem' }}>
        <form onSubmit={handleSubmit} style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Type */}
          <div>
            <label style={labelStyle}>What are you contributing? *</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
              {CONTRIBUTION_TYPES.map(t => (
                <label
                  key={t.value}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px 16px',
                    background: type === t.value ? 'rgba(200,169,110,0.08)' : '#161616',
                    cursor: 'pointer',
                    borderLeft: type === t.value ? '3px solid #c8a96e' : '3px solid transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    name="type"
                    value={t.value}
                    checked={type === t.value}
                    onChange={() => setType(t.value)}
                    style={{ accentColor: '#c8a96e' }}
                  />
                  <div>
                    <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '13px', color: type === t.value ? '#c8a96e' : '#f0ede8' }}>
                      {t.label}
                    </div>
                    <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57', marginTop: '2px' }}>
                      {t.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label style={labelStyle}>Your name <span style={{ color: '#3a3835' }}>(optional)</span></label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="How should we address you?"
              style={inputStyle}
            />
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>Email *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="We'll use this to follow up"
              required
              style={inputStyle}
            />
          </div>

          {/* Title */}
          <div>
            <label style={labelStyle}>Title / subject *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={
                type === 'Source Material' ? 'e.g. Maverick 2001 Catalogue — original copy' :
                type === 'Testimonial' ? 'e.g. Worked at Maverick 2000–2003' :
                type === 'Article' ? 'e.g. The story of the SF-1 Streetfighter' :
                'Brief title for your contribution'
              }
              required
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Tell us more</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={6}
              placeholder={
                type === 'Source Material' ? 'What do you have? Condition, provenance, how you came to have it. For physical items, describe what you have and we\'ll arrange how to get it digitised.' :
                type === 'Testimonial' ? 'Your account, in your own words. Any role, timeframe, or specific knowledge you can share.' :
                type === 'Article' ? 'Summary of what you want to write, or paste your draft here.' :
                'Any relevant details.'
              }
              style={{ ...inputStyle, resize: 'vertical', minHeight: '140px' }}
            />
          </div>

          {/* URL */}
          <div>
            <label style={labelStyle}>Link <span style={{ color: '#3a3835' }}>(optional)</span></label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="Google Drive, Dropbox, or any relevant URL"
              style={inputStyle}
            />
            {type === 'Source Material' && (
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57', marginTop: '8px', lineHeight: 1.6 }}>
                If you have scans, you can upload them to Google Drive or Dropbox and share the link here. For physical originals, leave this blank — we&apos;ll arrange next steps.
              </p>
            )}
          </div>

          {errorMsg && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(192,57,43,0.1)',
              border: '1px solid rgba(192,57,43,0.3)',
              fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#c0392b',
            }}>
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'submitting' || !type || !email || !title}
            style={{
              background: status === 'submitting' || !type || !email || !title ? '#2a2826' : '#c8a96e',
              color: status === 'submitting' || !type || !email || !title ? '#5c5a57' : '#000',
              fontFamily: 'var(--font-dm-mono)',
              fontSize: '12px', fontWeight: 600, letterSpacing: '1.5px',
              textTransform: 'uppercase',
              padding: '14px 32px',
              border: 'none', cursor: status === 'submitting' || !type || !email || !title ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
              alignSelf: 'flex-start',
            }}
          >
            {status === 'submitting' ? 'Sending...' : 'Submit Contribution'}
          </button>
        </form>
      </section>
    </>
  )
}
