'use client'

import type { FieldDef } from '@/lib/submission-fields'

export const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-zinc-500'
export const selectCls = inputCls + ' appearance-none'

export type RefOption = { id: string; display_name: string }
export type FieldStatus = 'original' | 'aftermarket' | 'unsure'

export type AftermarketPart = {
  id: string
  part_type: string
  brand: string
  model: string
  pickup_type: string | null
  status: string
}

/** A part chosen from the shared list, or a new one the owner is adding (created when they submit) */
export type PartChoice =
  | { kind: 'existing'; id: string }
  | { kind: 'new'; brand: string; model: string; pickup_type: string }

export const OTHER_SENTINEL = '__other__'
const NEW_PART_SENTINEL = '__new_part__'

const PART_TYPE_LABEL: Record<string, string> = { pickup: 'pickup', bridge: 'bridge', tuner: 'tuners' }

export function isAftermarketName(name: string) {
  return /aftermarket/i.test(name)
}

type Props = {
  def: FieldDef
  label?: string
  options: RefOption[]
  value: string
  status: FieldStatus
  /** The model's catalogue value, when there is one — shown as "pre-filled" until the owner changes it */
  specValue: string | null
  prefilled: boolean
  otherText: string
  part: PartChoice | null
  parts: AftermarketPart[]
  onValue: (v: string) => void
  onStatus: (s: FieldStatus) => void
  onOther: (v: string) => void
  onPart: (p: PartChoice | null) => void
}

export default function SpecFieldRow({
  def, label, options, value, status, specValue, prefilled, otherText, part, parts,
  onValue, onStatus, onOther, onPart,
}: Props) {
  const isRef = (def.kind ?? 'ref') === 'ref'
  const aftermarketOpts = options.filter(o => isAftermarketName(o.display_name))
  const factoryOpts = options.filter(o => !isAftermarketName(o.display_name))

  // In "aftermarket" mode a field with a single named aftermarket value uses it; several → pick one;
  // none → the owner describes what is fitted using the normal list.
  const shownOpts = status === 'aftermarket' && aftermarketOpts.length > 0 ? aftermarketOpts : factoryOpts
  const usesPartPicker = status === 'aftermarket' && !!def.part

  const statuses: { id: FieldStatus; text: string }[] = [
    { id: 'original', text: 'Original' },
    ...(def.flaggable ? [{ id: 'aftermarket' as const, text: 'Aftermarket' }] : []),
    { id: 'unsure', text: 'Not sure' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
        <label className="text-sm text-zinc-400" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>{label ?? def.label}</span>
          {prefilled && status === 'original' && value === specValue && value !== '' && (
            <span style={{ fontSize: '9px', color: '#c8a96e', fontFamily: 'var(--font-dm-mono)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              pre-filled
            </span>
          )}
        </label>
        <div style={{ display: 'inline-flex', border: '1px solid rgba(255,255,255,0.1)' }}>
          {statuses.map(s => {
            const active = status === s.id
            const isMod = s.id === 'aftermarket'
            return (
              <button
                key={s.id} type="button" onClick={() => onStatus(s.id)}
                style={{
                  padding: '2px 8px', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-dm-mono)', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase',
                  background: active ? (isMod ? '#b8553a' : s.id === 'unsure' ? '#3a3835' : '#c8a96e') : 'transparent',
                  color: active ? (s.id === 'unsure' ? '#f0ede8' : '#000') : '#5c5a57',
                }}
              >{s.text}</button>
            )
          })}
        </div>
      </div>

      {status === 'unsure' ? (
        <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#3a3835', padding: '8px 0' }}>
          Will be recorded as unknown.
        </p>
      ) : usesPartPicker ? (
        <>
          {aftermarketOpts.length > 1 && (
            <select value={value} onChange={e => onValue(e.target.value)} className={selectCls} style={{ marginBottom: '6px' }}>
              <option value="">Type of {PART_TYPE_LABEL[def.part!]}…</option>
              {aftermarketOpts.map(o => <option key={o.id} value={o.id}>{o.display_name}</option>)}
            </select>
          )}
          <PartPicker partType={def.part!} parts={parts} choice={part} onChange={onPart} />
        </>
      ) : isRef ? (
        <>
          <select
            value={value === '' && otherText ? OTHER_SENTINEL : value}
            onChange={e => onValue(e.target.value)}
            className={selectCls}
          >
            <option value="">Select…</option>
            {shownOpts.map(o => <option key={o.id} value={o.id}>{o.display_name}</option>)}
            {status === 'original' && <option value={OTHER_SENTINEL}>Original, but not in this list…</option>}
          </select>
          {status === 'original' && (value === OTHER_SENTINEL || (value === '' && otherText)) && (
            <>
              <input
                type="text" value={otherText} maxLength={300}
                onChange={e => onOther(e.target.value)}
                placeholder="Describe what it is — it will be reviewed for the spec sheet"
                className={inputCls} style={{ marginTop: '6px' }}
              />
            </>
          )}
          {status === 'aftermarket' && aftermarketOpts.length === 0 && (
            <input
              type="text" value={otherText} maxLength={300}
              onChange={e => onOther(e.target.value)}
              placeholder="What is fitted now? (optional)"
              className={inputCls} style={{ marginTop: '6px' }}
            />
          )}
        </>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="number" step={def.kind === 'count' ? 1 : 0.1} value={value}
            onChange={e => onValue(e.target.value)}
            placeholder={def.placeholder} className={inputCls}
          />
          {def.unit && <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#5c5a57' }}>{def.unit}</span>}
        </div>
      )}
    </div>
  )
}

function PartPicker({ partType, parts, choice, onChange }: {
  partType: string
  parts: AftermarketPart[]
  choice: PartChoice | null
  onChange: (p: PartChoice | null) => void
}) {
  const list = parts
    .filter(p => p.part_type === partType)
    .sort((a, b) => (a.brand + a.model).localeCompare(b.brand + b.model))
  const isNew = choice?.kind === 'new'
  const selectValue = isNew ? NEW_PART_SENTINEL : choice?.kind === 'existing' ? choice.id : ''

  return (
    <div>
      <select
        value={selectValue} className={selectCls}
        onChange={e => {
          const v = e.target.value
          if (!v) onChange(null)
          else if (v === NEW_PART_SENTINEL) onChange({ kind: 'new', brand: '', model: '', pickup_type: partType === 'pickup' ? 'Humbucker' : '' })
          else onChange({ kind: 'existing', id: v })
        }}
      >
        <option value="">Choose the fitted {PART_TYPE_LABEL[partType]}…</option>
        {list.map(p => (
          <option key={p.id} value={p.id}>
            {p.brand} — {p.model}{p.pickup_type ? ` (${p.pickup_type})` : ''}{p.status === 'unverified' ? ' · unverified' : ''}
          </option>
        ))}
        <option value={NEW_PART_SENTINEL}>+ Add one that isn&apos;t listed…</option>
      </select>

      {isNew && choice?.kind === 'new' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
          <input
            type="text" value={choice.brand} maxLength={80} placeholder="Brand, e.g. Seymour Duncan"
            onChange={e => onChange({ ...choice, brand: e.target.value })} className={inputCls}
          />
          <input
            type="text" value={choice.model} maxLength={120} placeholder="Model, e.g. JB SH-4"
            onChange={e => onChange({ ...choice, model: e.target.value })} className={inputCls}
          />
          {partType === 'pickup' && (
            <select
              value={choice.pickup_type} className={selectCls} style={{ gridColumn: '1 / -1' }}
              onChange={e => onChange({ ...choice, pickup_type: e.target.value })}
            >
              <option value="Humbucker">Humbucker</option>
              <option value="Single coil">Single coil</option>
              <option value="Other">Other</option>
            </select>
          )}
        </div>
      )}
    </div>
  )
}
