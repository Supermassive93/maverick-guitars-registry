import { Suspense } from 'react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import FormClosed from '@/components/FormClosed'
import { IS_LOCAL_DEV } from '@/lib/config'
import SubmitForm from './SubmitForm'

export default async function SubmitPage() {
  const supabase = await createSupabaseServerClient()
  const { data: settingsRaw } = await supabase.from('site_settings').select('submissions_open').maybeSingle()
  const data = settingsRaw as { submissions_open: boolean } | null

  if (!IS_LOCAL_DEV && data && !data.submissions_open) {
    return (
      <FormClosed
        title="SUBMISSIONS PAUSED"
        message="Guitar submissions are temporarily closed. Check back soon."
      />
    )
  }

  return <Suspense><SubmitForm /></Suspense>
}
