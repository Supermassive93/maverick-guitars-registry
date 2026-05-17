import { createSupabaseServerClient } from '@/lib/supabase-server'
import FormClosed from '@/components/FormClosed'
import RegisterForm from './RegisterForm'

export default async function RegisterPage() {
  const supabase = await createSupabaseServerClient()
  const { data: settingsRaw } = await supabase.from('site_settings').select('registration_open').maybeSingle()
  const data = settingsRaw as { registration_open: boolean } | null

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
