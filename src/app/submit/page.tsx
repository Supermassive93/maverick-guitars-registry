import { createSupabaseServerClient } from '@/lib/supabase-server'
import { PRERELEASE } from '@/lib/config'
import Link from 'next/link'
import FormClosed from '@/components/FormClosed'
import SubmitForm from './SubmitForm'

export default async function SubmitPage() {
  if (PRERELEASE) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
        <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-bebas)', fontSize: '42px', letterSpacing: '2px', color: '#f0ede8', marginBottom: '12px' }}>
            SUBMISSIONS OPENING SOON
          </p>
          <p style={{ color: '#9e9b96', fontSize: '14px', lineHeight: 1.7, fontFamily: 'var(--font-dm-mono)', marginBottom: '32px' }}>
            The registry is currently in pre-release. Guitar submissions will open to the public shortly.
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
  const { data } = await supabase.from('site_settings').select('submissions_open').maybeSingle()

  if (data && !data.submissions_open) {
    return (
      <FormClosed
        title="SUBMISSIONS PAUSED"
        message="Guitar submissions are temporarily closed. Check back soon."
      />
    )
  }

  return <SubmitForm />
}
