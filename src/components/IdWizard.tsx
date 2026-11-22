'use client'

import { useEffect, useState } from 'react'
import {
  GENERATION_NAMES, MODELS, withArticle, MODEL_MAP, WIZARD_VERSION, getQuestion, resolve,
  type PathStep, type WizardResult,
} from '@/lib/id-wizard-config'

const STORAGE_KEY = 'maverick-id-wizard-path'
const mono = { fontFamily: 'var(--font-dm-mono)' } as const

function Tile({ label, image, selected, zoomable, onClick }: {
  label: string; image?: string; selected?: boolean; zoomable?: boolean; onClick: () => void
}) {
  const [missing, setMissing] = useState(!image)
  const [zoom, setZoom] = useState(false)
  return (
    <>
      <div style={{ position: 'relative' }}>
        <button
          type="button" onClick={onClick}
          style={{
            width: '100%', textAlign: 'left', cursor: 'pointer', padding: 0,
            background: '#161616', color: '#f0ede8',
            border: `1px solid ${selected ? '#c8a96e' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          <div style={{ aspectRatio: '4 / 3', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {!missing && image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={label} onError={() => setMissing(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ ...mono, fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: '#3a3835', padding: '8px', textAlign: 'center' }}>
                Image coming
              </span>
            )}
          </div>
          <div style={{ padding: '12px 14px', fontSize: '14px', lineHeight: 1.4 }}>{label}</div>
        </button>
        {zoomable && !missing && (
          <button type="button" aria-label={`Enlarge ${label}`} onClick={() => setZoom(true)}
            style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.7)', color: '#c8a96e', border: 'none', padding: '4px 8px', cursor: 'pointer', ...mono, fontSize: '11px' }}>
            ⤢
          </button>
        )}
      </div>
      {zoom && image && (
        <div onClick={() => setZoom(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={label} style={{ maxWidth: '90vw', maxHeight: '90vh' }} />
        </div>
      )}
    </>
  )
}

export default function IdWizard({ onConfirmed }: { onConfirmed: (result: WizardResult) => void }) {
  const [path, setPath] = useState<PathStep[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY)
        if (saved) setPath(JSON.parse(saved))
      } catch { /* storage unavailable */ }
      setLoaded(true)
    }, 0)
    return () => clearTimeout(t)
  }, [])

  function update(next: PathStep[]) {
    setPath(next)
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* storage unavailable */ }
  }

  if (!loaded) return null

  const state = resolve(path)
  const btn = { ...mono, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', padding: '8px 16px', cursor: 'pointer', background: 'transparent' } as const

  const nav = (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
      <button type="button" disabled={path.length === 0} onClick={() => update(path.slice(0, -1))}
        style={{ ...btn, color: path.length ? '#9e9b96' : '#3a3835', border: '1px solid rgba(255,255,255,0.1)', cursor: path.length ? 'pointer' : 'not-allowed' }}>← Back</button>
      <button type="button" onClick={() => update([])} style={{ ...btn, color: '#9e9b96', border: '1px solid rgba(255,255,255,0.1)' }}>Start again</button>
    </div>
  )

  const wrap = (children: React.ReactNode) => (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px 96px' }}>{nav}{children}</div>
  )

  if (state.status === 'result') {
    const model = MODEL_MAP.get(state.model)
    const result: WizardResult = {
      wizardVersion: WIZARD_VERSION, entry: state.entry, modelCode: state.model,
      generation: state.generation, path, completedAt: new Date().toISOString(),
    }
    return wrap(
      <>
        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {model && (
            // Same size as a tile on the models page (280 × 677) so the whole image shows
            <div style={{
              flex: '0 0 280px', width: '280px', height: '677px', maxWidth: '100%',
              background: `url(/model-tiles/${model.tile}.jpg) center / cover no-repeat, #161616`,
              border: '1px solid rgba(255,255,255,0.08)',
            }} role="img" aria-label={model.displayName} />
          )}
          <div style={{ flex: '1 1 340px', minWidth: 0 }}>
            <h1 style={{ fontFamily: 'var(--font-bebas)', fontSize: 'clamp(36px, 6vw, 56px)', letterSpacing: '2px', color: '#f0ede8', marginBottom: '8px' }}>
              Your Maverick is {model ? withArticle(model.displayName) : state.model}
            </h1>
            <p style={{ ...mono, fontSize: '13px', color: '#c8a96e', marginBottom: '24px' }}>{GENERATION_NAMES[state.generation]}</p>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
              {path.map((s, i) => {
                const q = getQuestion(s.questionId)
                const label = s.questionId === 'Q_SELECT_MODEL'
                  ? MODEL_MAP.get(s.choice)?.displayName
                  : q?.options.find(x => x.id === s.choice)?.label
                return (
                  <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <p style={{ ...mono, fontSize: '11px', color: '#5c5a57', lineHeight: 1.5, marginBottom: '2px' }}>{q?.prompt}</p>
                    <p style={{ fontSize: '14px', color: '#d4d0ca' }}>
                      {label}{' '}
                      <button type="button" onClick={() => update(path.slice(0, i))} style={{ ...mono, fontSize: '10px', color: '#c8a96e', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Edit</button>
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '40px' }}>
          <button type="button" onClick={() => { try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* storage unavailable */ } onConfirmed(result) }} style={{ ...btn, background: '#c8a96e', color: '#000', border: '1px solid #c8a96e' }}>Correct — continue</button>
          <button type="button" onClick={() => update([])} style={{ ...btn, color: '#9e9b96', border: '1px solid rgba(255,255,255,0.1)' }}>Incorrect — start again</button>
        </div>
      </>
    )
  }

  const { question, step } = state
  const picked = path[step - 1]?.choice
  const choose = (choice: string) => update([...path, { questionId: question.id, choice }])

  return wrap(
    <>
      <p style={{ ...mono, fontSize: '11px', letterSpacing: '3px', color: '#5c5a57', textTransform: 'uppercase', marginBottom: '12px' }}>Step {step}</p>
      <h1 style={{ fontFamily: 'var(--font-bebas)', fontSize: 'clamp(30px, 5vw, 48px)', letterSpacing: '1.5px', color: '#f0ede8', lineHeight: 1.1, marginBottom: '12px' }}>
        {question.prompt}
      </h1>
      {question.help && <p style={{ fontSize: '14px', color: '#9e9b96', lineHeight: 1.6, marginBottom: '8px' }}>{question.help}</p>}
      <p style={{ ...mono, fontSize: '11px', color: '#5c5a57', lineHeight: 1.6, marginBottom: '28px' }}>
        If your guitar has been modified, answer as if it were stock. Modifications are recorded later on the spec sheet.
      </p>

      {question.inputType === 'model-picker' ? (
        (['bass', 'guitar'] as const).map(family => (
          <div key={family} style={{ marginBottom: '32px' }}>
            <p style={{ ...mono, fontSize: '11px', letterSpacing: '2px', color: '#c8a96e', textTransform: 'uppercase', marginBottom: '12px' }}>
              {family === 'bass' ? 'Basses' : 'Guitars'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px' }}>
              {MODELS.filter(m => m.family === family).map(m => (
                <Tile key={m.code} label={m.displayName} image={`/model-tiles/${m.tile}.jpg`} selected={picked === m.code} onClick={() => choose(m.code)} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px' }}>
          {question.options.map(opt => (
            <Tile key={opt.id} label={opt.label} image={`/wizard/tiles/${opt.id}.webp`} zoomable={opt.zoomable} selected={picked === opt.id} onClick={() => choose(opt.id)} />
          ))}
        </div>
      )}
    </>
  )
}
