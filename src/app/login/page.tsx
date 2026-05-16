'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/profile'
  const urlError = searchParams.get('error')

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(urlError ?? '')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createSupabaseBrowserClient()
    const trimmed = identifier.trim()

    let email = trimmed

    // If identifier doesn't contain @ treat it as a username and resolve to email
    if (!trimmed.includes('@')) {
      const { data: resolvedEmail, error: rpcError } = await supabase
        .rpc('get_email_from_username', { p_username: trimmed.toLowerCase() })

      if (rpcError || !resolvedEmail) {
        setError('No account found with that username or email.')
        setLoading(false)
        return
      }
      email = resolvedEmail as string
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      // Don't distinguish between "wrong password" and "wrong username" — prevents enumeration
      setError('Invalid credentials. Check your username/email and password.')
      setLoading(false)
    } else {
      router.push(next)
      router.refresh()
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '24px', letterSpacing: '3px', color: '#c8a96e' }}>
              MAVERICK
            </span>
            <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57', marginLeft: '8px', letterSpacing: '1px' }}>
              REGISTRY
            </span>
          </Link>
          <p style={{ color: '#5c5a57', fontSize: '13px', fontFamily: 'var(--font-dm-mono)', marginTop: '8px', letterSpacing: '0.5px' }}>
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Username or email</label>
            <input
              type="text"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              required
              autoComplete="username"
              placeholder="your_username or email@example.com"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={inputStyle}
            />
          </div>

          {error && (
            <p style={{ color: '#c0392b', fontSize: '13px', fontFamily: 'var(--font-dm-mono)', lineHeight: 1.5 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#8b6e3f' : '#c8a96e',
              color: '#000',
              fontFamily: 'var(--font-dm-mono)',
              fontSize: '12px', fontWeight: 500, letterSpacing: '1px',
              padding: '11px 24px', border: 'none', width: '100%',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? 'SIGNING IN…' : 'SIGN IN'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#5c5a57', fontSize: '13px', fontFamily: 'var(--font-dm-mono)', marginTop: '24px' }}>
          No account?{' '}
          <Link href="/register" style={{ color: '#9e9b96', textDecoration: 'underline', textUnderlineOffset: '3px' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#c8a96e')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#9e9b96')}
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
