import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Guitar } from '@/lib/types'
import AdminDashboard from './AdminDashboard'

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: pending } = await supabase
    .from('guitars')
    .select('*')
    .eq('status', 'Pending')
    .order('date_submitted', { ascending: true })

  const { data: recent } = await supabase
    .from('guitars')
    .select('*')
    .in('status', ['Approved', 'Rejected'])
    .order('last_updated', { ascending: false })
    .limit(20)

  return (
    <AdminDashboard
      pending={(pending ?? []) as Guitar[]}
      recent={(recent ?? []) as Guitar[]}
    />
  )
}
