import { supabase } from '@/lib/supabase'
import type { Guitar } from '@/lib/types'
import GuitarCard from '@/components/GuitarCard'
import RegistryStats from '@/components/RegistryStats'

export const revalidate = 60

async function getGuitars(): Promise<Guitar[]> {
  const { data, error } = await supabase
    .from('guitars')
    .select('*')
    .eq('status', 'Approved')
    .order('mgr_id', { ascending: true })

  if (error) {
    console.error('Error fetching guitars:', error)
    return []
  }
  return data as Guitar[]
}

export default async function RegistryPage() {
  const guitars = await getGuitars()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-3">
          Maverick Guitars Registry
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          A permanent community record of surviving Maverick Guitar Company instruments.
          Every guitar registered here is part of the historical archive.
        </p>
      </div>

      <RegistryStats count={guitars.length} />

      {guitars.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-zinc-500 text-lg mb-2">No guitars registered yet.</p>
          <p className="text-zinc-600">Be the first — <a href="/submit" className="text-red-500 hover:text-red-400 underline underline-offset-2">submit your guitar</a>.</p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {guitars.map((guitar) => (
            <GuitarCard key={guitar.id} guitar={guitar} />
          ))}
        </div>
      )}
    </div>
  )
}
