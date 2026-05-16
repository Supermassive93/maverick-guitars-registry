'use client'

import { useState } from 'react'
import type { Guitar } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Props {
  pending: Guitar[]
  recent: Guitar[]
}

function formatMgrId(id: number) {
  return `MGR-${String(id).padStart(4, '0')}`
}

function Row({ label, value }: { label: string; value?: string | number | string[] | null }) {
  if (!value && value !== 0) return null
  const display = Array.isArray(value) ? value.join(', ') : String(value)
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-zinc-500 shrink-0 w-44">{label}</span>
      <span className="text-zinc-200">{display}</span>
    </div>
  )
}

function GuitarPanel({ guitar, onAction }: { guitar: Guitar; onAction: () => void }) {
  const [open, setOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState(guitar.admin_notes ?? '')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function act(status: 'Approved' | 'Rejected') {
    setLoading(true)
    const { error } = await supabase
      .from('guitars')
      .update({
        status,
        admin_notes: adminNotes || null,
        date_approved: status === 'Approved' ? new Date().toISOString() : null,
        verified_by: 'Admin',
      } as never)
      .eq('id', guitar.id)

    if (error) {
      setMsg('Error: ' + error.message)
    } else {
      setMsg(status === 'Approved' ? 'Approved ✓' : 'Rejected ✗')
      setTimeout(onAction, 800)
    }
    setLoading(false)
  }

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-900/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-zinc-500">{formatMgrId(guitar.mgr_id)}</span>
          <span className="font-semibold text-white">{guitar.model ?? 'Unknown model'}</span>
          {guitar.serial && <span className="text-zinc-400 text-sm font-mono">{guitar.serial}</span>}
          {guitar.generation && <span className="text-xs text-zinc-600">{guitar.generation}</span>}
        </div>
        <span className="text-zinc-600 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-zinc-800 px-5 py-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <Row label="Serial" value={guitar.serial} />
            <Row label="Serial status" value={guitar.serial_status} />
            <Row label="Series" value={guitar.series} />
            <Row label="Model" value={guitar.model} />
            <Row label="Generation" value={guitar.generation} />
            <Row label="Catalogue year" value={guitar.catalogue_year} />
            <Row label="Finish type" value={guitar.finish_type} />
            <Row label="Factory colour" value={guitar.factory_colour} />
            <Row label="Custom Shop colour" value={guitar.custom_shop_colour} />
            <Row label="Body wood" value={guitar.body_wood} />
            <Row label="Body shape" value={guitar.body_shape_analogue} />
            <Row label="Pickup config" value={guitar.pickup_configuration} />
            <Row label="Neck pickup" value={guitar.neck_pickup} />
            <Row label="Bridge pickup" value={guitar.bridge_pickup} />
            <Row label="Bridge" value={guitar.bridge_configuration} />
            <Row label="Hardware colour" value={guitar.hardware_colour} />
            <Row label="Headstock logo" value={guitar.headstock_logo} />
            <Row label="Bridge logo" value={guitar.bridge_logo} />
            <Row label="Pickup surrounds" value={guitar.pickup_surrounds} />
            <Row label="Neck binding" value={guitar.neck_binding} />
            <Row label="Switch type" value={guitar.switch_type} />
            <Row label="Switch knob" value={guitar.switch_knob} />
            <Row label="Potentiometers" value={guitar.potentiometers} />
            <Row label="Whammy bar" value={guitar.whammy_bar} />
            <Row label="Neck construction" value={guitar.neck_construction} />
            <Row label="Skunk stripe" value={guitar.skunk_stripe} />
            <Row label="Headstock angle" value={guitar.headstock_break_angle != null ? `${guitar.headstock_break_angle}°` : null} />
            <Row label="Neck pitch" value={guitar.neck_pitch != null ? `${guitar.neck_pitch}mm` : null} />
            <Row label="Left handed" value={guitar.left_handed} />
            <Row label="Source type" value={guitar.source_type} />
            <Row label="Last price" value={guitar.last_price != null ? `£${guitar.last_price}` : null} />
            <Row label="Submitter email" value={guitar.submitter_email} />
            <Row label="Submission notes" value={guitar.submission_notes} />
            <Row label="Source URL" value={guitar.source_url} />
            <Row label="Images" value={guitar.image_urls} />
          </div>

          {guitar.status === 'Pending' && (
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <div>
                <label className="block text-sm text-zinc-500 mb-1">Admin notes (optional)</label>
                <textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  rows={2}
                  placeholder="Internal notes — never shown publicly"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-zinc-500 resize-none"
                />
              </div>
              {msg && <p className="text-sm text-zinc-400">{msg}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => act('Approved')}
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm rounded font-medium transition-colors disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => act('Rejected')}
                  disabled={loading}
                  className="px-5 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded font-medium transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard({ pending, recent }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<'pending' | 'recent'>('pending')

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const guitars = tab === 'pending' ? pending : recent

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin</h1>
          <p className="text-zinc-500 text-sm mt-1">Review and curate submissions</p>
        </div>
        <button onClick={signOut} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          Sign out
        </button>
      </div>

      <div className="flex gap-1 mb-6 bg-zinc-900 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${tab === 'pending' ? 'bg-white text-zinc-950' : 'text-zinc-400 hover:text-white'}`}
        >
          Pending {pending.length > 0 && <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pending.length}</span>}
        </button>
        <button
          onClick={() => setTab('recent')}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${tab === 'recent' ? 'bg-white text-zinc-950' : 'text-zinc-400 hover:text-white'}`}
        >
          Recent decisions
        </button>
      </div>

      {guitars.length === 0 ? (
        <p className="text-zinc-600 text-sm py-8 text-center">
          {tab === 'pending' ? 'No pending submissions.' : 'No decisions yet.'}
        </p>
      ) : (
        <div className="space-y-3">
          {guitars.map(g => (
            <GuitarPanel
              key={g.id}
              guitar={g}
              onAction={() => router.refresh()}
            />
          ))}
        </div>
      )}
    </div>
  )
}
