import Link from 'next/link'
import type { Guitar } from '@/lib/types'

interface Props {
  guitar: Guitar
}

function formatMgrId(id: number) {
  return `MGR-${String(id).padStart(4, '0')}`
}

function confidenceBadge(source: string | null) {
  const map: Record<string, { label: string; colour: string }> = {
    'Catalogue Confirmed': { label: 'Catalogue', colour: 'bg-emerald-900/60 text-emerald-400' },
    'Press Confirmed':     { label: 'Press', colour: 'bg-blue-900/60 text-blue-400' },
    'Owner Confirmed':     { label: 'Owner', colour: 'bg-violet-900/60 text-violet-400' },
    'Registry Derived':    { label: 'Registry', colour: 'bg-yellow-900/60 text-yellow-400' },
    'Unverified':          { label: 'Unverified', colour: 'bg-zinc-800 text-zinc-500' },
  }
  const entry = source ? map[source] : null
  if (!entry) return null
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-mono ${entry.colour}`}>
      {entry.label}
    </span>
  )
}

export default function GuitarCard({ guitar }: Props) {
  return (
    <Link
      href={`/guitar/${guitar.mgr_id}`}
      className="group block bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-600 transition-colors"
    >
      <div className="aspect-square bg-zinc-800 relative overflow-hidden">
        {guitar.primary_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={guitar.primary_image_url}
            alt={`${guitar.model ?? 'Guitar'} ${guitar.serial ?? ''}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-700 text-5xl font-mono">
            ♦
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="bg-zinc-950/80 text-zinc-300 text-xs font-mono px-2 py-1 rounded">
            {formatMgrId(guitar.mgr_id)}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="font-semibold text-white text-sm">
            {guitar.model ?? 'Unknown model'}
          </p>
          {guitar.generation && (
            <span className="text-xs text-zinc-500 font-mono shrink-0">{guitar.generation}</span>
          )}
        </div>

        {guitar.serial && (
          <p className="text-zinc-400 text-xs font-mono mb-2">{guitar.serial}</p>
        )}

        <div className="flex flex-wrap gap-1 mt-2">
          {guitar.factory_colour && (
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
              {guitar.factory_colour.split(' — ')[0]}
            </span>
          )}
          {confidenceBadge(guitar.specification_source)}
        </div>

        {(guitar.last_known_city || guitar.last_known_country) && (
          <p className="text-zinc-600 text-xs mt-2 truncate">
            📍 {[guitar.last_known_city, guitar.last_known_country].filter(Boolean).join(', ')}
          </p>
        )}
      </div>
    </Link>
  )
}
