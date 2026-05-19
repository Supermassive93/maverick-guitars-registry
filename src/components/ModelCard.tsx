'use client'

import Link from 'next/link'
import { useState } from 'react'

type Props = {
  model: string
  description: string | null
  rarity: string | null
  slug: string
  accentColor: string
  bass?: boolean
}

export default function ModelCard({ model, description, rarity, slug, accentColor, bass = false }: Props) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      href={`/models/${slug}`}
      style={{
        background: hovered ? '#1e1c1a' : '#161616',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        flex: '0 0 280px',
        transition: 'background 0.15s',
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
      }}>
        {model}
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

      <p style={{
        fontSize: '13px', color: '#9e9b96', lineHeight: 1.6,
        margin: '12px 0 0',
      }}>
        {description}
      </p>
    </Link>
  )
}
