import { createSupabaseServerClient } from '@/lib/supabase-server'
import FormClosed from '@/components/FormClosed'
import ContributeForm from './ContributeForm'

export default async function ContributePage() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('site_settings').select('contributions_open').maybeSingle()

  if (data && !data.contributions_open) {
    return (
      <FormClosed
        title="CONTRIBUTIONS PAUSED"
        message="The contributions form is temporarily closed. Check back soon."
      />
    )
  }

  return <ContributeForm />
}
