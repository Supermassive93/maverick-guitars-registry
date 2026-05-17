'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#1e1e1e',
  border: '1px solid rgba(255,255,255,0.12)',
  padding: '10px 12px',
  color: '#f0ede8',
  fontSize: '14px',
  fontFamily: 'var(--font-dm-sans)',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  color: '#9e9b96',
  fontFamily: 'var(--font-dm-mono)',
  marginBottom: '6px',
  letterSpacing: '0.5px',
}

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/

export default function RegisterForm() {
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function checkUsername(value: string) {
    if (!value) { setUsernameStatus('idle'); return }
    if (!USERNAME_REGEX.test(value)) { setUsernameStatus('invalid'); return }
    setUsernameStatus('checking')
    const supabase = createSupabaseBrowserClient()
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', value.toLowerCase())
      .maybeSingle()
    setUsernameStatus(data ? 'taken' : 'available')
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!USERNAME_REGEX.test(username)) {
      setError('Username must be 3–20 characters and contain only letters, numbers, underscores or hyphens.')
      return
    }
    if (usernameStatus === 'taken') { setError('That username is already taken.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }

    setLoading(true)

    const supabase = createSupabaseBrowserClient()

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle()

    if (existing) {
      setError('That username was just taken — please choose another.')
      setLoading(false)
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username.toLowerCase() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  const usernameHint = () => {
    if (usernameStatus === 'invalid') return { text: '3–20 chars, letters / numbers / _ / - only', colour: '#c0392b' }
    if (usernameStatus === 'checking') return { text: 'Checking…', colour: '#5c5a57' }
    if (usernameStatus === 'taken') return { text: 'Username already taken', colour: '#c0392b' }
    if (usernameStatus === 'available') return { text: 'Available', colour: '#27ae60' }
    return { text: 'This is the name other users will see — no personal info', colour: '#5c5a57' }
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
        <div style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '24px', letterSpacing: '3px', color: '#c8a96e' }}>MAVERICK</span>
            <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57', marginLeft: '8px', letterSpacing: '1px' }}>REGISTRY</span>
          </Link>
          <p style={{ fontFamily: 'var(--font-bebas)', fontSize: '42px', letterSpacing: '2px', color: '#f0ede8', marginTop: '32px', marginBottom: '8px' }}>CHECK YOUR EMAIL</p>
          <p style={{ color: '#9e9b96', fontSize: '14px', lineHeight: 1.7, fontFamily: 'var(--font-dm-mono)', marginBottom: '8px' }}>
            A confirmation link has been sent. Click it to activate your account.
          </p>
          <p style={{ color: '#5c5a57', fontSize: '12px', fontFamily: 'var(--font-dm-mono)' }}>
            Your username <span style={{ color: '#c8a96e' }}>{username.toLowerCase()}</span> is reserved.
          </p>
          <Link
            href="/login"
            style={{ display: 'inline-block', marginTop: '28px', fontSize: '13px', color: '#5c5a57', fontFamily: 'var(--font-dm-mono)', textDecoration: 'none' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#9e9b96')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#5c5a57')}
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  const hint = usernameHint()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '24px', letterSpacing: '3px', color: '#c8a96e' }}>MAVERICK</span>
            <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57', marginLeft: '8px', letterSpacing: '1px' }}>REGISTRY</span>
          </Link>
          <p style={{ color: '#5c5a57', fontSize: '13px', fontFamily: 'var(--font-dm-mono)', marginTop: '8px', letterSpacing: '0.5px' }}>
            Create your account
          </p>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div>
            <label style={labelStyle}>Username *</label>
            <input
              type="text"
              value={username}
              onChange={e => {
                setUsername(e.target.value)
                setUsernameStatus('idle')
              }}
              onBlur={() => checkUsername(username)}
              required
              autoComplete="username"
              placeholder="e.g. maverick_alex"
              style={{
                ...inputStyle,
                borderColor: usernameStatus === 'taken' || usernameStatus === 'invalid'
                  ? 'rgba(192,57,43,0.5)'
                  : usernameStatus === 'available'
                  ? 'rgba(39,174,96,0.4)'
                  : 'rgba(255,255,255,0.12)',
              }}
            />
            <p style={{ fontSize: '11px', fontFamily: 'var(--font-dm-mono)', marginTop: '6px', color: hint.colour }}>
              {hint.text}
            </p>
          </div>

          <div>
            <label style={labelStyle}>Email *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={inputStyle}
            />
            <p style={{ fontSize: '11px', fontFamily: 'var(--font-dm-mono)', marginTop: '6px', color: '#5c5a57' }}>
              Used for login and account recovery only — never displayed
            </p>
          </div>

          <div>
            <label style={labelStyle}>Password *</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Confirm password *</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              style={inputStyle}
            />
          </div>

          {error && (
            <p style={{ color: '#c0392b', fontSize: '13px', fontFamily: 'var(--font-dm-mono)', lineHeight: 1.5 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || usernameStatus === 'taken' || usernameStatus === 'invalid'}
            style={{
              background: loading || usernameStatus === 'taken' || usernameStatus === 'invalid' ? '#2a2826' : '#c8a96e',
              color: loading || usernameStatus === 'taken' || usernameStatus === 'invalid' ? '#5c5a57' : '#000',
              fontFamily: 'var(--font-dm-mono)',
              fontSize: '12px', fontWeight: 500, letterSpacing: '1px',
              padding: '11px 24px', border: 'none', width: '100%',
              cursor: loading || usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            {loading ? 'CREATING ACCOUNT…' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#5c5a57', fontSize: '13px', fontFamily: 'var(--font-dm-mono)', marginTop: '24px' }}>
          Already registered?{' '}
          <Link href="/login" style={{ color: '#9e9b96', textDecoration: 'underline', textUnderlineOffset: '3px' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#c8a96e')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#9e9b96')}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
