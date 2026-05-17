'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Guitar } from '@/lib/types'

interface Props {
  guitars: Guitar[]
}

function formatMgrId(id: number) {
  return `MGR-${String(id).padStart(4, '0')}`
}

const inputStyle = {
  background: '#161616',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#f0ede8',
  fontFamily: 'var(--font-dm-mono)',
  fontSize: '13px',
  padding: '10px 14px',
  outline: 'none',
}

export default function RegistrySection({ guitars }: Props) {
  const [search, setSearch] = useState('')
  const [filterModel, setFilterModel] = useState('')
  const [filterGen, setFilterGen] = useState('')

  const models = useMemo(() => {
    const set = new Set(guitars.map(g => g.model).filter(Boolean))
    return Array.from(set).sort() as string[]
  }, [guitars])

  const generations = useMemo(() => {
    const set = new Set(guitars.map(g => g.generation).filter(Boolean))
    return Array.from(set).sort() as string[]
  }, [guitars])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return guitars.filter(g => {
      if (filterModel && g.model !== filterModel) return false
      if (filterGen && g.generation !== filterGen) return false
      if (!q) return true
      return [g.serial, g.model, g.factory_colour, g.last_known_city, g.last_known_country]
        .some(v => v?.toLowerCase().includes(q))
    })
  }, [guitars, search, filterModel, filterGen])

  const isPrePopulated = (g: Guitar) => g.status === 'Pre-populated'

  const approved = guitars.filter(g => g.status === 'Approved')
  const gen1 = approved.filter(g => g.generation === 'Gen 1').length
  const gen2 = approved.filter(g => g.generation === 'Gen 2').length

  return (
    <section id="registry" style={{ padding: '6rem 4rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <p style={{
        fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '3px',
        color: '#c8a96e', textTransform: 'uppercase', marginBottom: '16px',
      }}>
        Community Database
      </p>
      <h2 style={{
        fontFamily: 'var(--font-bebas)',
        fontSize: 'clamp(42px, 5vw, 72px)',
        letterSpacing: '2px', lineHeight: 0.95,
        color: '#f0ede8', marginBottom: '24px',
      }}>
        THE REGISTRY
      </h2>
      <p style={{ maxWidth: '600px', color: '#9e9b96', fontSize: '16px', lineHeight: 1.7, marginBottom: '48px' }}>
        Every known Maverick guitar documented in one place. Serial numbers, generation identifiers, provenance and specifications — built by owners, for owners.
      </p>

      {/* Stats bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: '32px',
      }}>
        {[
          { n: approved.length, l: 'Registered' },
          { n: gen1, l: 'Generation 1' },
          { n: gen2, l: 'Generation 2' },
          { n: models.length, l: 'Models' },
        ].map(({ n, l }, i) => (
          <div key={l} style={{
            padding: '24px 32px',
            borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none',
          }}>
            <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '48px', color: '#c8a96e', lineHeight: 1 }}>{n}</div>
            <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '2px', color: '#5c5a57', textTransform: 'uppercase', marginTop: '4px' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search serial, model, colour, location..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
        />
        <select
          value={filterModel}
          onChange={e => setFilterModel(e.target.value)}
          style={inputStyle}
        >
          <option value="">All models</option>
          {models.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          value={filterGen}
          onChange={e => setFilterGen(e.target.value)}
          style={inputStyle}
        >
          <option value="">All generations</option>
          {generations.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <Link href="/submit" style={{
          background: '#c8a96e', color: '#000',
          fontFamily: 'var(--font-dm-mono)', fontSize: '12px', fontWeight: 500,
          letterSpacing: '1px', padding: '10px 20px', textDecoration: 'none',
          whiteSpace: 'nowrap', display: 'inline-block',
        }}>
          + ADD GUITAR
        </Link>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-dm-mono)', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
              {['MGR ID', 'Serial', 'Model', 'Generation', 'Colour', 'Location', 'Source', 'Owner'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', color: '#5c5a57', fontSize: '11px',
                  letterSpacing: '2px', textTransform: 'uppercase',
                  padding: '10px 14px', fontWeight: 400,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{
                  textAlign: 'center', padding: '64px 14px',
                  color: '#5c5a57', fontSize: '13px', letterSpacing: '1px',
                  border: '1px dashed rgba(255,255,255,0.08)',
                }}>
                  {guitars.length === 0 ? 'NO GUITARS REGISTERED YET' : 'NO MATCHING GUITARS FOUND'}
                </td>
              </tr>
            ) : filtered.map(g => {
              const pre = isPrePopulated(g)
              return (
                <tr
                  key={g.id}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    cursor: pre ? 'default' : 'pointer',
                    transition: 'background 0.15s',
                    opacity: pre ? 0.45 : 1,
                  }}
                  className={pre ? undefined : 'registry-row'}
                  onClick={pre ? undefined : () => window.location.href = `/guitar/${g.mgr_id}`}
                >
                  <td style={{ padding: '13px 14px', color: pre ? '#5c5a57' : '#c8a96e' }}>
                    {pre ? '—' : formatMgrId(g.mgr_id)}
                  </td>
                  <td style={{ padding: '13px 14px', color: pre ? '#5c5a57' : '#f0ede8' }}>{g.serial ?? '—'}</td>
                  <td style={{ padding: '13px 14px', color: pre ? '#5c5a57' : '#f0ede8' }}>{g.model ?? '—'}</td>
                  <td style={{ padding: '13px 14px' }}>
                    {g.generation ? (
                      <span style={{
                        display: 'inline-block',
                        fontSize: '10px', letterSpacing: '1px', padding: '3px 8px',
                        textTransform: 'uppercase',
                        background: g.generation.includes('1') ? 'rgba(200,169,110,0.15)' : 'rgba(100,160,220,0.1)',
                        color: g.generation.includes('1') ? '#c8a96e' : '#6aafd4',
                        border: `1px solid ${g.generation.includes('1') ? 'rgba(200,169,110,0.3)' : 'rgba(100,160,220,0.25)'}`,
                      }}>
                        {g.generation}
                      </span>
                    ) : <span style={{ color: '#3a3835' }}>—</span>}
                  </td>
                  <td style={{ padding: '13px 14px', color: '#5c5a57' }}>
                    {pre ? '—' : (g.factory_colour ? g.factory_colour.split(' — ')[0] : '—')}
                  </td>
                  <td style={{ padding: '13px 14px', color: '#5c5a57' }}>
                    {pre ? '—' : ([g.last_known_city, g.last_known_country].filter(Boolean).join(', ') || '—')}
                  </td>
                  <td style={{ padding: '13px 14px', color: '#5c5a57' }}>
                    {pre ? '—' : (g.specification_source ?? '—')}
                  </td>
                  <td style={{ padding: '13px 14px' }}>
                    {pre ? (
                      <Link
                        href={`/submit?model=${encodeURIComponent(g.model ?? '')}&serial=${encodeURIComponent(g.serial ?? '')}`}
                        style={{ color: '#c8a96e', fontSize: '12px', fontFamily: 'var(--font-dm-mono)', textDecoration: 'none', letterSpacing: '0.5px' }}
                        onClick={e => e.stopPropagation()}
                      >
                        Claim this guitar →
                      </Link>
                    ) : (
                      <span style={{ color: '#5c5a57', fontStyle: g.registered_by === 'Guest' ? 'italic' : 'normal' }}>
                        {g.registered_by ?? 'Guest'}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
