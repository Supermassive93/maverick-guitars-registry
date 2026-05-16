'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/

const inputStyle: React.CSSProperties = {
  background: '#1e1e1e',
  border: '1px solid rgba(255,255,255,0.12)',
  padding: '8px 10px',
  color: '#f0ede8',
  fontSize: '13px',
  fontFamily: 'var(--font-dm-mono)',
  outline: 'none',
  width: '200px',
}

export default function UsernameEditForm({ userId, currentUsername }: { userId: string; currentUsername: string }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(currentUsername)
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function checkUsername(v: string) {
    if (!v || v === currentUsername) { setStatus('idle'); return }
    if (!USERNAME_REGEX.test(v)) { setStatus('invalid'); return }
    setStatus('checking')
    const supabase = createSupabaseBrowserClient()
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', v.toLowerCase())
      .maybeSingle()
    setStatus(data ? 'taken' : 'available')
  }

  async function handleSave() {
    if (!USERNAME_REGEX.test(value)) { setError('Invalid username format.'); return }
    if (status === 'taken') { setError('That username is already taken.'); return }
    if (value.toLowerCase() === currentUsername.toLowerCase()) { setEditing(false); return }

    setSaving(true)
    setError('')
    const supabase = createSupabaseBrowserClient()
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ username: value.toLowerCase() })
      .eq('id', userId)

    setSaving(false)
    if (updateError) {
      setError(updateError.message)
    } else {
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const hintColour =
    status === 'invalid' || status === 'taken' ? '#c0392b'
    : status === 'available' ? '#27ae60'
    : '#5c5a57'

  const hintText =
    status === 'invalid' ? '3–20 chars, letters / numbers / _ / - only'
    : status === 'checking' ? 'Checking…'
    : status === 'taken' ? 'Username already taken'
    : status === 'available' ? 'Available'
    : ''

  if (!editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: '#9e9b96', fontSize: '13px', fontFamily: 'var(--font-dm-mono)' }}>
          {currentUsername}
        </span>
        {saved && (
          <span style={{ color: '#27ae60', fontSize: '11px', fontFamily: 'var(--font-dm-mono)' }}>Saved</span>
        )}
        <button
          onClick={() => { setEditing(true); setValue(currentUsername); setStatus('idle'); setError('') }}
          style={{
            background: 'none',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#5c5a57',
            fontSize: '11px',
            fontFamily: 'var(--font-dm-mono)',
            padding: '4px 10px',
            cursor: 'pointer',
            letterSpacing: '0.5px',
          }}
        >
          Edit
        </button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="text"
          value={value}
          onChange={e => { setValue(e.target.value); setStatus('idle') }}
          onBlur={() => checkUsername(value)}
          style={{
            ...inputStyle,
            borderColor:
              status === 'taken' || status === 'invalid' ? 'rgba(192,57,43,0.5)'
              : status === 'available' ? 'rgba(39,174,96,0.4)'
              : 'rgba(255,255,255,0.12)',
          }}
          autoFocus
        />
        <button
          onClick={handleSave}
          disabled={saving || status === 'taken' || status === 'invalid'}
          style={{
            background: saving || status === 'taken' || status === 'invalid' ? '#2a2826' : '#c8a96e',
            color: saving || status === 'taken' || status === 'invalid' ? '#5c5a57' : '#000',
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '1px',
            padding: '8px 14px',
            border: 'none',
            cursor: saving || status === 'taken' || status === 'invalid' ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={() => { setEditing(false); setError('') }}
          style={{
            background: 'none',
            border: 'none',
            color: '#5c5a57',
            fontSize: '11px',
            fontFamily: 'var(--font-dm-mono)',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
      {hintText && (
        <p style={{ fontSize: '11px', fontFamily: 'var(--font-dm-mono)', marginTop: '5px', color: hintColour }}>
          {hintText}
        </p>
      )}
      {error && (
        <p style={{ fontSize: '11px', fontFamily: 'var(--font-dm-mono)', marginTop: '5px', color: '#c0392b' }}>
          {error}
        </p>
      )}
    </div>
  )
}
