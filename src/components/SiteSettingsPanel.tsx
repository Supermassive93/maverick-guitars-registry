'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

type Settings = {
  submissions_open: boolean
  registration_open: boolean
  contributions_open: boolean
}

const FEATURES: { key: keyof Settings; label: string; description: string }[] = [
  { key: 'submissions_open',  label: 'Guitar submissions',  description: 'Allow users to submit guitars to the registry' },
  { key: 'registration_open', label: 'New registrations',   description: 'Allow new users to create accounts' },
  { key: 'contributions_open', label: 'Contributions form', description: 'Allow users to submit archive material' },
]

export default function SiteSettingsPanel({ initial }: { initial: Settings }) {
  const [settings, setSettings] = useState<Settings>(initial)
  const [saving, setSaving] = useState<keyof Settings | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof Settings, string>>>({})

  async function toggle(key: keyof Settings) {
    const newValue = !settings[key]
    setSaving(key)
    setErrors(prev => ({ ...prev, [key]: undefined }))

    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase
      .from('site_settings')
      .update({ [key]: newValue, updated_at: new Date().toISOString() })
      .eq('id', true)

    setSaving(null)
    if (error) {
      setErrors(prev => ({ ...prev, [key]: error.message }))
    } else {
      setSettings(prev => ({ ...prev, [key]: newValue }))
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
      {FEATURES.map(({ key, label, description }) => {
        const isOn = settings[key]
        const isSaving = saving === key
        const err = errors[key]
        return (
          <div key={key} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', background: '#161616', gap: '20px',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#f0ede8' }}>
                  {label}
                </p>
                <span style={{
                  fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: isOn ? '#4ade80' : '#c0392b',
                  background: isOn ? 'rgba(74,222,128,0.1)' : 'rgba(192,57,43,0.12)',
                  padding: '2px 6px',
                }}>
                  {isOn ? 'Live' : 'Off'}
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: '#5c5a57' }}>
                {description}
              </p>
              {err && (
                <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: '#c0392b', marginTop: '3px' }}>
                  {err}
                </p>
              )}
            </div>
            <button
              onClick={() => toggle(key)}
              disabled={isSaving}
              title={isOn ? 'Click to disable' : 'Click to enable'}
              style={{
                flexShrink: 0,
                width: '44px', height: '24px',
                borderRadius: '12px',
                background: isOn ? '#c8a96e' : '#2a2826',
                border: 'none',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                position: 'relative',
                transition: 'background 0.2s',
                opacity: isSaving ? 0.5 : 1,
              }}
            >
              <span style={{
                position: 'absolute',
                top: '3px',
                left: isOn ? '23px' : '3px',
                width: '18px', height: '18px',
                borderRadius: '50%',
                background: isOn ? '#000' : '#5c5a57',
                transition: 'left 0.2s, background 0.2s',
                display: 'block',
              }} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
