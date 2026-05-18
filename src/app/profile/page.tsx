import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Guitar } from '@/lib/types'
import { getModelName } from '@/lib/types'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'
import UsernameEditForm from '@/components/UsernameEditForm'
import SiteSettingsPanel from '@/components/SiteSettingsPanel'

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/profile')

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('username, role')
    .eq('id', user.id)
    .single()

  const profile = profileRaw as { username: string | null; role: string | null } | null
  const username = profile?.username ?? 'unknown'
  const role = profile?.role ?? 'user'
  const isAdmin = ['admin', 'user_admin', 'super_admin'].includes(role)

  const { data: siteSettingsRaw } = await supabase
    .from('site_settings')
    .select('submissions_open, registration_open, contributions_open')
    .maybeSingle()
  const siteSettings = siteSettingsRaw as { submissions_open: boolean; registration_open: boolean; contributions_open: boolean } | null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: guitarsRaw } = await supabase
    .from('guitars')
    .select('id, mgr_id, model_id, serial, series, generation, status, date_submitted, primary_image_url, model_specifications(model)')
    .eq('user_id', user.id)
    .order('date_submitted', { ascending: false })
  const guitars = guitarsRaw as Guitar[] | null

  const pending  = (guitars ?? []).filter(g => g.status === 'Pending')
  const approved = (guitars ?? []).filter(g => g.status === 'Approved')
  const rejected = (guitars ?? []).filter(g => g.status === 'Rejected')

  function formatMgrId(id: number) {
    return `MGR-${String(id).padStart(4, '0')}`
  }

  function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { color: string; bg: string }> = {
      Approved: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
      Pending:  { color: '#c8a96e', bg: 'rgba(200,169,110,0.12)' },
      Rejected: { color: '#c0392b', bg: 'rgba(192,57,43,0.12)' },
    }
    const s = map[status] ?? { color: '#5c5a57', bg: 'rgba(255,255,255,0.04)' }
    return (
      <span style={{
        fontSize: '11px',
        fontFamily: 'var(--font-dm-mono)',
        color: s.color,
        background: s.bg,
        padding: '3px 8px',
        letterSpacing: '0.3px',
      }}>
        {status}
      </span>
    )
  }

  function GuitarRow({ guitar }: { guitar: Partial<Guitar> & { status: string; mgr_id: number } }) {
    const inner = (
      <div className="guitar-row" style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        transition: 'background 0.15s',
      }}>
        <div style={{
          width: '40px', height: '40px',
          background: '#1e1e1e',
          flexShrink: 0,
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {guitar.primary_image_url
            ? <img src={guitar.primary_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ color: '#2a2a2a', fontSize: '18px' }}>♦</span>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: '#f0ede8', fontSize: '14px', fontWeight: 500 }}>{getModelName(guitar as Guitar)}</p>
          {guitar.serial && <p style={{ color: '#5c5a57', fontSize: '11px', fontFamily: 'var(--font-dm-mono)' }}>{guitar.serial}</p>}
        </div>
        <span style={{ color: '#5c5a57', fontSize: '11px', fontFamily: 'var(--font-dm-mono)' }} className="hidden sm:block">
          {formatMgrId(guitar.mgr_id)}
        </span>
        <StatusBadge status={guitar.status} />
      </div>
    )

    return guitar.status === 'Approved'
      ? <Link href={`/guitar/${guitar.mgr_id}`} style={{ textDecoration: 'none', display: 'block' }}>{inner}</Link>
      : inner
  }

  function SectionLabel({ label }: { label: string }) {
    return (
      <p style={{
        fontSize: '10px',
        fontFamily: 'var(--font-dm-mono)',
        color: '#5c5a57',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        marginBottom: '8px',
        marginTop: '24px',
      }}>
        {label}
      </p>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '40px' }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: '2rem',
            letterSpacing: '2px',
            color: '#f0ede8',
            lineHeight: 1,
            marginBottom: '4px',
          }}>
            My guitars
          </h1>
          <p style={{ color: '#5c5a57', fontSize: '11px', fontFamily: 'var(--font-dm-mono)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '2px' }}>Signed in as</p>
          <p style={{ color: '#c8a96e', fontSize: '14px', fontFamily: 'var(--font-dm-mono)' }}>{username}</p>
        </div>
        <Link
          href="/submit"
          className="btn-gold"
          style={{
            color: '#000',
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '1px',
            padding: '8px 16px',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            display: 'inline-block',
          }}
        >
          + REGISTER GUITAR
        </Link>
      </div>

      {(guitars ?? []).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <p style={{ color: '#5c5a57', fontSize: '14px', marginBottom: '16px' }}>
            You haven&apos;t registered any guitars yet.
          </p>
          <Link
            href="/submit"
            style={{ color: '#c8a96e', fontSize: '13px', textDecoration: 'underline', textUnderlineOffset: '3px' }}
          >
            Register your first guitar
          </Link>
        </div>
      ) : (
        <div>
          {pending.length > 0 && (
            <div>
              <SectionLabel label="Awaiting review" />
              <div style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#161616' }}>
                {pending.map(g => <GuitarRow key={g.id} guitar={g as Guitar} />)}
              </div>
            </div>
          )}
          {approved.length > 0 && (
            <div>
              <SectionLabel label="In the registry" />
              <div style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#161616' }}>
                {approved.map(g => <GuitarRow key={g.id} guitar={g as Guitar} />)}
              </div>
            </div>
          )}
          {rejected.length > 0 && (
            <div>
              <SectionLabel label="Not approved" />
              <div style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#161616' }}>
                {rejected.map(g => <GuitarRow key={g.id} guitar={g as Guitar} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {isAdmin && (
        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{
            fontSize: '10px',
            fontFamily: 'var(--font-dm-mono)',
            color: '#c8a96e',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            Admin tools
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <Link
              href="/admin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#f0ede8',
                fontSize: '13px',
                fontFamily: 'var(--font-dm-mono)',
                textDecoration: 'none',
                padding: '10px 16px',
                border: '1px solid rgba(200,169,110,0.25)',
                background: 'rgba(200,169,110,0.05)',
              }}
            >
              <span style={{ color: '#c8a96e' }}>→</span>
              Review submissions
            </Link>
          </div>

          <p style={{
            fontSize: '10px',
            fontFamily: 'var(--font-dm-mono)',
            color: '#5c5a57',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '10px',
          }}>
            Site controls
          </p>
          <SiteSettingsPanel initial={{
            submissions_open:  siteSettings?.submissions_open  ?? true,
            registration_open: siteSettings?.registration_open ?? true,
            contributions_open: siteSettings?.contributions_open ?? true,
          }} />

          <p style={{
            fontSize: '10px',
            fontFamily: 'var(--font-dm-mono)',
            color: '#3a3835',
            letterSpacing: '1px',
            marginTop: '12px',
          }}>
            Role: {role}
          </p>
        </div>
      )}

      <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{
          fontSize: '10px',
          fontFamily: 'var(--font-dm-mono)',
          color: '#5c5a57',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}>
          Account
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-dm-mono)', color: '#5c5a57', width: '80px', letterSpacing: '0.5px' }}>Username</span>
            <UsernameEditForm userId={user.id} currentUsername={username} />
          </div>
        </div>
        <SignOutButton />
      </div>
    </div>
  )
}
