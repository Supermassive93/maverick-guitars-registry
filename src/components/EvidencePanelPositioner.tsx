'use client'

import { useEffect } from 'react'

const MARGIN = 16

// One delegated listener for the whole app, not one per icon — cheap regardless of how many
// evidence clusters are on a page, since it only does work when a panel is actually opened.
// The panel is always laid out (just invisible via CSS), so its real on-screen rect can be
// measured the moment the pointer/focus enters its trigger, before the opacity transition
// even starts. If it would spill past the viewport edge, shift it back on-screen with a
// transform; otherwise clear any transform left over from a previous, differently-placed panel
// reusing the same DOM node (there isn't one, but this keeps re-entry idempotent either way).
function positionPanel(trigger: Element) {
  const panel = trigger.querySelector<HTMLElement>('.evidence-panel')
  if (!panel) return

  panel.style.transform = ''
  const rect = panel.getBoundingClientRect()
  const viewportWidth = window.innerWidth

  let shift = 0
  if (rect.left < MARGIN) shift = MARGIN - rect.left
  else if (rect.right > viewportWidth - MARGIN) shift = (viewportWidth - MARGIN) - rect.right

  if (shift !== 0) panel.style.transform = `translateX(${shift}px)`
}

export default function EvidencePanelPositioner() {
  useEffect(() => {
    function handle(e: Event) {
      const target = e.target as Element | null
      const trigger = target?.closest?.('.group')
      if (trigger && trigger.querySelector('.evidence-panel')) positionPanel(trigger)
    }
    // 'focusin' bubbles (unlike 'focus'), so this one listener catches both pointer and
    // keyboard entry into any trigger, present or future, without per-icon wiring.
    document.addEventListener('mouseover', handle)
    document.addEventListener('focusin', handle)
    return () => {
      document.removeEventListener('mouseover', handle)
      document.removeEventListener('focusin', handle)
    }
  }, [])

  return null
}
