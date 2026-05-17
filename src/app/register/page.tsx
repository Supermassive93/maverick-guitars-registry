import { createSupabaseServerClient } from '@/lib/supabase-server'
import { PRERELEASE } from '@/lib/config'
import Link from 'next/link'
import FormClosed from '@/components/FormClosed'
import RegisterForm from './RegisterForm'

export default async function RegisterPage() {
  if (PRERELEASE) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
        <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '24px', letterSpacing: '3px', color: '#c8a96e' }}>MAVERICK</span>
            <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57', marginLeft: '8px', letterSpacing: '1px' }}>REGISTRY</span>
          </Link>
          <p style={{ fontFamily: 'var(--font-bebas)', fontSize: '42px', letterSpacing: '2px', color: '#f0ede8', marginTop: '40px', marginBottom: '12px' }}>
            COMING SOON
          </p>
          <p style={{ color: '#9e9b96', fontSize: '14px', lineHeight: 1.7, fontFamily: 'var(--font-dm-mono)', marginBottom: '32px' }}>
            The registry is currently in pre-release. Public registration will open shortly — check back soon.
          </p>
          <Link
            href="/"
            style={{ display: 'inline-block', fontSize: '12px', color: '#5c5a57', fontFamily: 'var(--font-dm-mono)', letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none' }}
          >
            ← Back to registry
          </Link>
        </div>
      </div>
    )
  }

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('site_settings').select('registration_open').maybeSingle()

  if (data && !data.registration_open) {
    return (
      <FormClosed
        title="REGISTRATION PAUSED"
        message="New account registration is temporarily closed. Check back soon."
      />
    )
  }

  return <RegisterForm />
}
