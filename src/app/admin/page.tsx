import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getRefValues } from '@/lib/ref-values'
import type { Guitar } from '@/lib/types'
import AdminDashboard from './AdminDashboard'

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const [{ data: pending }, { data: recent }, refMap] = await Promise.all([
    supabase
      .from('guitars')
      .select('*, model_specifications(model)')
      .eq('status', 'Pending')
      .order('date_submitted', { ascending: true }),
    supabase
      .from('guitars')
      .select('*, model_specifications(model)')
      .in('status', ['Approved', 'Rejected'])
      .order('last_updated', { ascending: false })
      .limit(20),
    getRefValues(),
  ])

  return (
    <AdminDashboard
      pending={(pending ?? []) as Guitar[]}
      recent={(recent ?? []) as Guitar[]}
      refMap={refMap}
    />
  )
}
