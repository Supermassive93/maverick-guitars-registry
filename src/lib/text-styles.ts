import type { CSSProperties } from 'react'

// The uppercase mono-font label used throughout the site for section eyebrows,
// badges, and micro-labels. Size and letter-spacing vary by context; color and
// any margin/transform stay at the call site.
export function monoLabel(size: string, spacing: string): CSSProperties {
  return { fontFamily: 'var(--font-dm-mono)', fontSize: size, letterSpacing: spacing }
}
