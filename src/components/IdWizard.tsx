'use client'

import { useState } from 'react'
import { DECK_CSS } from '@/lib/deck-css'
import {
  GENERATION_NAMES, MODELS, withArticle, MODEL_MAP, WIZARD_VERSION, getQuestion, resolve,
  type PathStep, type WizardResult,
} from '@/lib/id-wizard-config'

const mono = { fontFamily: 'var(--font-dm-mono)' } as const

// Same tile size as the models page (the JR4 picture is wider, so its tile is too)
const TILE_WIDTH = 280
const TILE_HEIGHT = 677
const WIDE_TILES: Record<string, number> = { MDL_JR4: 470 }

// Order the models appear in the picker (anything not listed follows in config order). JR4 is last as its tile is wider.
const PICKER_ORDER = [
  'MDL_F1', 'MDL_F2', 'MDL_F3', 'MDL_F4', 'MDL_SF1', 'MDL_SF3', 'MDL_MATRIX', 'MDL_FDTOX',
  'MDL_X1', 'MDL_XTREME', 'MDL_XDTOX', 'MDL_CHAOS1', 'MDL_CHAOS2',
  'MDL_SPECIES1', 'MDL_SPECIES2', 'MDL_SPECIES3', 'MDL_SPECIES7', 'MDL_G1', 'MDL_G2', 'MDL_JR4',
]
const pickerRank = (code: string) => { const i = PICKER_ORDER.indexOf(code); return i === -1 ? 999 : i }

// One card in the fanned deck. Shares the deck layout and hover riffle with the models page.
function DeckCard({ code, name, tile, index, selected, onClick }: {
  code: string; name: string; tile: string; index: number; selected: boolean; onClick: () => void
}) {
  const width = WIDE_TILES[code] ?? TILE_WIDTH
  return (
    <button
      type="button" onClick={onClick} className="deck-card" data-i={index} aria-label={name}
      style={{
        // The deck overlap is worked out from --card-w, so a wide tile uses the standard width there (otherwise it
        // would tuck far back over its neighbours); the row gets matching right padding for the extra width
        ['--card-w' as string]: `${TILE_WIDTH}px`,
        flex: `0 0 ${width}px`, width: `${width}px`, height: `${TILE_HEIGHT}px`,
        boxSizing: 'border-box', overflow: 'hidden', cursor: 'pointer', textAlign: 'left',
        padding: '2rem', border: 'none',
        outline: selected ? '2px solid #c8a96e' : 'none', outlineOffset: '-2px',
        background: `linear-gradient(to bottom, rgba(14,14,14,0.88) 0%, rgba(14,14,14,0) 24%), url(/model-tiles/${tile}.jpg) center / cover no-repeat, #161616`,
      }}
    >
      <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '52px', color: '#c8a96e', letterSpacing: '3px', lineHeight: 1 }}>{name}</span>
    </button>
  )
}

function Tile({ label, image, glyph, selected, zoomable, onClick }: {
  label: string; image?: string; glyph?: string; selected?: boolean; zoomable?: boolean; onClick: () => void
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
            {glyph ? (
              <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '96px', color: '#c8a96e', lineHeight: 1 }}>{glyph}</span>
            ) : !missing && image ? (
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

  // Progress lives in component state only: every visit to the wizard starts at the first question
  const update = (next: PathStep[]) => setPath(next)

  const state = resolve(path)
  const btn = { ...mono, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', padding: '8px 16px', cursor: 'pointer', background: 'transparent' } as const

  const nav = (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
      <button type="button" disabled={path.length === 0} onClick={() => update(path.slice(0, -1))}
        style={{ ...btn, color: path.length ? '#9e9b96' : '#3a3835', border: '1px solid rgba(255,255,255,0.1)', cursor: path.length ? 'pointer' : 'not-allowed' }}>← Back</button>
      <button type="button" onClick={() => update([])} style={{ ...btn, color: '#9e9b96', border: '1px solid rgba(255,255,255,0.1)' }}>Start again</button>
    </div>
  )

  const wide = state.status === 'question' && state.question.inputType === 'model-picker'
  const wrap = (children: React.ReactNode) => (
    <div style={{ maxWidth: wide ? '1600px' : '960px', margin: '0 auto', padding: '48px 24px 96px' }}>{nav}{children}</div>
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
          <button type="button" onClick={() => onConfirmed(result)} style={{ ...btn, background: '#c8a96e', color: '#000', border: '1px solid #c8a96e' }}>Correct — continue</button>
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
        <>
          <style>{DECK_CSS}</style>
          {(['guitar', 'bass'] as const).map(family => {
            const list = MODELS.filter(m => m.family === family).sort((a, b) => pickerRank(a.code) - pickerRank(b.code))
            return (
              <div key={family} style={{ marginBottom: '16px' }}>
                <p style={{ ...mono, fontSize: '11px', letterSpacing: '2px', color: '#c8a96e', textTransform: 'uppercase' }}>
                  {family === 'bass' ? 'Basses' : 'Guitars'}
                </p>
                <div className="model-deck" style={{
                  ['--deck-n' as string]: list.length,
                  ['--deck-min-strip' as string]: '40px',
                  paddingRight: list.reduce((sum, m) => sum + (WIDE_TILES[m.code] ?? TILE_WIDTH) - TILE_WIDTH, 0),
                }}>
                  {list.map((m, i) => (
                    <DeckCard key={m.code} code={m.code} name={m.displayName} tile={m.tile} index={i} selected={picked === m.code} onClick={() => choose(m.code)} />
                  ))}
                </div>
              </div>
            )
          })}
        </>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px' }}>
          {question.options.map(opt => (
            <Tile key={opt.id} label={opt.label} image={opt.image ?? `/wizard/tiles/${opt.id}.webp`} glyph={opt.glyph} zoomable={opt.zoomable} selected={picked === opt.id} onClick={() => choose(opt.id)} />
          ))}
        </div>
      )}
    </>
  )
}
