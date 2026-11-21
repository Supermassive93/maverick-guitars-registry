'use client'

import Link from 'next/link'
import { useState } from 'react'

type Props = {
  model: string
  nickname?: string
  description: string | null
  rarity: string | null
  slug: string
  accentColor: string
  bass?: boolean
  image?: string | null
  /** Override the standard tile width for a special-size tile (e.g. the extra-wide JR4). */
  width?: number
  /** Position within its series row — lets the deck hover riffle the cards around this one. */
  index?: number
}

// Every model tile is the same fixed size on every series row. These are the dimensions the
// Evolution series tiles already rendered at (280px wide, 677px tall — the height those tiles
// stretched to for their longest description), so Evolution looks unchanged and the other
// series now match it.
const TILE_WIDTH = 280
const TILE_HEIGHT = 677

export default function ModelCard({ model, nickname, description, rarity, slug, accentColor, bass = false, image = null, width = TILE_WIDTH, index = 0 }: Props) {
  const [hovered, setHovered] = useState(false)

  // With background art the title sits at the top and the synopsis at the bottom, each on a
  // dark fade so the text stays readable and the guitar shows through in the middle. The
  // fade lifts slightly on hover.
  const scrimTop = `linear-gradient(to bottom, rgba(14,14,14,${hovered ? 0.7 : 0.88}) 0%, rgba(14,14,14,0) 24%)`
  const scrimBottom = `linear-gradient(to top, rgba(14,14,14,${hovered ? 0.8 : 0.94}) 0%, rgba(14,14,14,0) 34%)`

  return (
    <Link
      href={`/models/${slug}`}
      className="deck-card"
      data-i={index}
      style={{
        ['--card-w' as string]: `${width}px`,
        background: image ? `${scrimTop}, ${scrimBottom}, url(${image}) center / cover no-repeat, #161616`
                          : hovered ? '#1e1c1a' : '#161616',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        flex: `0 0 ${width}px`,
        width: `${width}px`,
        height: `${TILE_HEIGHT}px`,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        fontFamily: 'var(--font-bebas)',
        fontSize: '52px',
        color: accentColor,
        letterSpacing: '3px',
        lineHeight: 1,
        marginBottom: '8px',
        display: 'flex', alignItems: 'baseline', gap: '12px',
      }}>
        {model}
        {nickname && (
          <span style={{ fontSize: '15px', color: image ? '#9e9b96' : '#3a3835', letterSpacing: '2px' }}>
            {nickname}
          </span>
        )}
      </div>

      {rarity && (
        <div style={{
          display: 'inline-block',
          fontFamily: 'var(--font-dm-mono)', fontSize: '10px',
          letterSpacing: '1.5px', textTransform: 'uppercase',
          color: bass ? '#5c5a57' : '#8b6e3f',
          background: bass ? 'rgba(255,255,255,0.04)' : 'rgba(200,169,110,0.08)',
          padding: '3px 8px', marginBottom: '8px',
          alignSelf: 'flex-start',
        }}>
          {rarity}
        </div>
      )}

      {image ? (
        <p className="deck-synopsis" style={{
          marginTop: 'auto', marginBottom: 0,
          fontSize: '14px', color: '#d8d5d0', lineHeight: 1.5,
        }}>
          {description}
        </p>
      ) : (
        /* Fills the rest of the fixed-height tile; text longer than the space fades out at the
           bottom (the full description is on the model's own page). */
        <div className="deck-synopsis" style={{
          flex: 1, minHeight: 0, overflow: 'hidden', marginTop: '12px',
          WebkitMaskImage: 'linear-gradient(to bottom, #000 calc(100% - 40px), transparent 100%)',
          maskImage: 'linear-gradient(to bottom, #000 calc(100% - 40px), transparent 100%)',
        }}>
          <p style={{
            fontSize: '13px', color: '#9e9b96', lineHeight: 1.6,
            margin: 0,
          }}>
            {description}
          </p>
        </div>
      )}
    </Link>
  )
}
