import { supabase } from './supabase'
import type { RefMap } from './types'

export type { RefMap }

export async function getRefValues(): Promise<RefMap> {
  const { data } = await supabase
    .from('ref_values')
    .select('id, display_name')
    .eq('is_active', true)
  if (!data) return {}
  return Object.fromEntries(data.map((r: { id: string; display_name: string }) => [r.id, r.display_name]))
}

// Resolve a ref ID to its display name, returning null if the input is null/empty.
// Falls back to the raw value if the ID is not found (handles plain-text legacy data gracefully).
export function r(map: RefMap, id: string | null | undefined): string | null {
  if (!id) return null
  return map[id] ?? id
}
