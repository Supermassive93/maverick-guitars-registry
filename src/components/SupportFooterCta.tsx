import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { IS_LOCAL_DEV } from '@/lib/config'

const BUY_ME_A_COFFEE_URL = 'https://www.buymeacoffee.com/maverickguitarsorg'

// A small "support the archive" prompt for the site footer. It follows the same switch as the
// Support page (site_settings.support_open), so it appears when that page opens and never links
// visitors to a closed page; it always shows when running locally.
export default async function SupportFooterCta() {
  if (!IS_LOCAL_DEV) {
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase.from('site_settings').select('support_open').maybeSingle()
    const settings = data as { support_open: boolean } | null
    if (settings && !settings.support_open) return null
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
      marginBottom: '1.75rem', paddingBottom: '1.75rem',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* The prompt and the button sit side by side (they stack on a narrow screen) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px 24px', flexWrap: 'wrap' }}>
        <p style={{
          fontFamily: 'var(--font-bebas)', fontSize: '26px', letterSpacing: '2px',
          color: '#f0ede8', lineHeight: 1,
        }}>Like what you see?</p>

        {/* Buy Me a Coffee's own button image (plain <img>: it's their hosted asset, not ours to optimise) */}
        <a href={BUY_ME_A_COFFEE_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', lineHeight: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
            alt="Buy Me a Coffee"
            width={181}
            height={50}
            style={{ height: '50px', width: '181px' }}
          />
        </a>
      </div>

      <Link href="/support" className="link-subtle" style={{
        fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
      }}>
        Learn what you&apos;re supporting →
      </Link>
    </div>
  )
}
