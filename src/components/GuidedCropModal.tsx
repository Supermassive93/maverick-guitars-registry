'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const POSITION_RATIOS: Record<string, number> = {
  'Full front':      2 / 3,
  'Full rear':       2 / 3,
  'Body front':      3 / 4,
  'Body rear':       3 / 4,
  'Headstock front': 3 / 4,
  'Headstock rear':  3 / 4,
}

const OUTPUT_SIZE: Record<string, [number, number]> = {
  'Full front':      [800, 1200],
  'Full rear':       [800, 1200],
  'Body front':      [900, 1200],
  'Body rear':       [900, 1200],
  'Headstock front': [900, 1200],
  'Headstock rear':  [900, 1200],
}

const BODY_SILHOUETTE_URLS: Record<string, Partial<Record<string, string>>> = {
  'Superstrat': {
    'Full front':  '/silhouettes/superstrat-full-front.svg',
    'Full rear':   '/silhouettes/superstrat-full-rear.svg',
    'Body front':  '/silhouettes/superstrat-body-front.svg',
    'Body rear':   '/silhouettes/superstrat-body-rear.svg',
  },
}

const HEADSTOCK_SILHOUETTE_URLS: Record<string, Partial<Record<string, string>>> = {
  '6-aside': {
    'Headstock front': '/silhouettes/headstock-6aside-front.svg',
    'Headstock rear':  '/silhouettes/headstock-6aside-rear.svg',
  },
}

type Props = {
  file: File
  position: string
  bodyShape?: string
  headstockStyle?: string
  onConfirm: (croppedFile: File) => void
  onCancel: () => void
}

export default function GuidedCropModal({ file, position, bodyShape, headstockStyle, onConfirm, onCancel }: Props) {
  const frameRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const drag = useRef<{ startX: number; startY: number; startTx: number; startTy: number } | null>(null)
  const lastPinchDist = useRef<number | null>(null)
  const transformRef = useRef({ x: 0, y: 0, scale: 1 })

  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })

  const ratio = POSITION_RATIOS[position] ?? 2 / 3
  const FRAME_W = 340
  const FRAME_H = Math.round(FRAME_W / ratio)

  const isHeadstock = position.startsWith('Headstock')
  const silhouetteUrl = isHeadstock
    ? (headstockStyle ? HEADSTOCK_SILHOUETTE_URLS[headstockStyle]?.[position] : undefined)
    : (bodyShape ? BODY_SILHOUETTE_URLS[bodyShape]?.[position] : undefined)

  // Keep transformRef in sync so native event handlers always read current values
  useEffect(() => { transformRef.current = transform }, [transform])

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Load image — keep URL alive until cleanup, never revoke inside onload
  useEffect(() => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      const scaleToFit = Math.max(FRAME_W / img.naturalWidth, FRAME_H / img.naturalHeight)
      const initScale = scaleToFit * 1.05
      const initX = (FRAME_W - img.naturalWidth * initScale) / 2
      const initY = (FRAME_H - img.naturalHeight * initScale) / 2
      const t = { x: initX, y: initY, scale: initScale }
      transformRef.current = t
      setTransform(t)
      setImgSrc(url)
    }
    img.src = url
    return () => URL.revokeObjectURL(url)
  }, [file, FRAME_W, FRAME_H])

  // Native wheel listener (non-passive so preventDefault works)
  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      const delta = -e.deltaY * 0.001
      setTransform(prev => {
        const next = Math.max(0.2, Math.min(10, prev.scale + delta * prev.scale))
        const cx = FRAME_W / 2
        const cy = FRAME_H / 2
        return {
          scale: next,
          x: cx - (cx - prev.x) * (next / prev.scale),
          y: cy - (cy - prev.y) * (next / prev.scale),
        }
      })
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [FRAME_W, FRAME_H])

  // Native touchmove listener (non-passive so preventDefault stops page scroll)
  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const handler = (e: TouchEvent) => {
      e.preventDefault()
      if (e.touches.length === 1 && drag.current) {
        const { startTx, startTy, startX, startY } = drag.current
        const t = e.touches[0]
        setTransform(prev => ({
          ...prev,
          x: startTx + (t.clientX - startX),
          y: startTy + (t.clientY - startY),
        }))
      } else if (e.touches.length === 2 && lastPinchDist.current !== null) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const dist = Math.hypot(dx, dy)
        const factor = dist / lastPinchDist.current
        lastPinchDist.current = dist
        setTransform(prev => ({
          ...prev,
          scale: Math.max(0.2, Math.min(10, prev.scale * factor)),
        }))
      }
    }
    el.addEventListener('touchmove', handler, { passive: false })
    return () => el.removeEventListener('touchmove', handler)
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const t = transformRef.current
    drag.current = { startX: e.clientX, startY: e.clientY, startTx: t.x, startTy: t.y }
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drag.current) return
    const { startTx, startTy, startX, startY } = drag.current
    setTransform(prev => ({
      ...prev,
      x: startTx + (e.clientX - startX),
      y: startTy + (e.clientY - startY),
    }))
  }, [])

  const onMouseUp = useCallback(() => { drag.current = null }, [])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const t = transformRef.current
      const touch = e.touches[0]
      drag.current = { startX: touch.clientX, startY: touch.clientY, startTx: t.x, startTy: t.y }
    } else if (e.touches.length === 2) {
      drag.current = null
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastPinchDist.current = Math.hypot(dx, dy)
    }
  }, [])

  const onTouchEnd = useCallback(() => {
    drag.current = null
    lastPinchDist.current = null
  }, [])

  function handleConfirm() {
    const img = imgRef.current
    if (!img || !imgSrc) return

    const [outW, outH] = OUTPUT_SIZE[position] ?? [800, 1200]
    const scaleX = outW / FRAME_W
    const scaleY = outH / FRAME_H

    const canvas = document.createElement('canvas')
    canvas.width = outW
    canvas.height = outH
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(
      img,
      transform.x * scaleX,
      transform.y * scaleY,
      img.naturalWidth * transform.scale * scaleX,
      img.naturalHeight * transform.scale * scaleY,
    )

    canvas.toBlob(blob => {
      if (!blob) return
      const slug = position.toLowerCase().replace(/\s+/g, '-')
      onConfirm(new File([blob], `${slug}.jpg`, { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.92)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--font-dm-mono)', fontSize: '9px',
          letterSpacing: '3px', textTransform: 'uppercase', color: '#c8a96e',
          marginBottom: '6px',
        }}>
          Position photo
        </p>
        <p style={{
          fontFamily: 'var(--font-bebas)', fontSize: '28px',
          letterSpacing: '2px', color: '#f0ede8',
        }}>
          {position.toUpperCase()}
        </p>
        <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57', marginTop: '4px' }}>
          Drag to reposition · Scroll or pinch to scale
        </p>
      </div>

      {/* Crop frame */}
      <div
        ref={frameRef}
        style={{
          position: 'relative',
          width: FRAME_W,
          height: FRAME_H,
          overflow: 'hidden',
          cursor: 'grab',
          flexShrink: 0,
          background: '#111',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Photo layer */}
        {imgSrc && imgRef.current && (
          <img
            src={imgSrc}
            alt=""
            draggable={false}
            style={{
              position: 'absolute',
              left: transform.x,
              top: transform.y,
              width: imgRef.current.naturalWidth * transform.scale,
              height: imgRef.current.naturalHeight * transform.scale,
              maxWidth: 'none',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />
        )}

        {/* Silhouette guide overlay */}
        <svg
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          width={FRAME_W}
          height={FRAME_H}
        >
          {silhouetteUrl ? (
            <image
              href={silhouetteUrl}
              x={0} y={0}
              width={FRAME_W}
              height={FRAME_H}
              preserveAspectRatio="xMidYMid meet"
              opacity={0.8}
            />
          ) : (
            <rect
              x={FRAME_W * 0.1}
              y={FRAME_H * 0.05}
              width={FRAME_W * 0.8}
              height={FRAME_H * 0.9}
              rx="12"
              fill="none"
              stroke="rgba(200,169,110,0.4)"
              strokeWidth="1"
              strokeDasharray="6 4"
            />
          )}
        </svg>

        {/* Corner marks */}
        {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map(corner => {
          const isRight = corner.includes('right')
          const isBottom = corner.includes('bottom')
          return (
            <div key={corner} style={{
              position: 'absolute',
              top: isBottom ? undefined : 0,
              bottom: isBottom ? 0 : undefined,
              left: isRight ? undefined : 0,
              right: isRight ? 0 : undefined,
              width: 16, height: 16,
              borderTop: isBottom ? 'none' : '2px solid rgba(200,169,110,0.6)',
              borderBottom: isBottom ? '2px solid rgba(200,169,110,0.6)' : 'none',
              borderLeft: isRight ? 'none' : '2px solid rgba(200,169,110,0.6)',
              borderRight: isRight ? '2px solid rgba(200,169,110,0.6)' : 'none',
            }} />
          )
        })}

        {/* Loading state */}
        {!imgSrc && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: 'var(--font-dm-mono)', fontSize: '10px',
              letterSpacing: '2px', textTransform: 'uppercase', color: '#3a3835',
            }}>Loading…</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '24px', alignItems: 'center' }}>
        <button
          onClick={onCancel}
          style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.1)',
            color: '#5c5a57', fontFamily: 'var(--font-dm-mono)',
            fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
            padding: '10px 24px', cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!imgSrc}
          style={{
            background: '#c8a96e', border: 'none',
            color: '#000', fontFamily: 'var(--font-dm-mono)',
            fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
            padding: '10px 32px', cursor: 'pointer',
            opacity: imgSrc ? 1 : 0.4,
          }}
        >
          Confirm crop
        </button>
      </div>
    </div>
  )
}
