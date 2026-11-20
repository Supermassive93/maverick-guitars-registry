import { supabase } from './supabase'

export type EvidenceStyle = 'solid' | 'outline'
export type LinkTarget = 'archive_source' | 'registry_guitar' | 'parent_model' | 'none'

export interface EvidenceType {
  id: string                // SCT ref ID
  label: string
  description: string
  icon: string               // Tabler icon name, e.g. "quote"
  colour: string
  style: EvidenceStyle
  strength_rank: number
  link_target: LinkTarget
}

export type EvidenceTypeMap = Record<string, EvidenceType>

// Not a row in evidence_types — this is a UI-only state for fields with zero citations,
// shown as a dashed grey ring. Shared between the EvidenceCluster panel and the Methodology
// legend so the explanation reads identically in both places.
export const UNSOURCED_LABEL = 'Unsourced'
export const UNSOURCED_DESCRIPTION = 'No citation has been logged for this fact yet. The value may still be correct — it just hasn’t been linked to a source, registry example, or parent model yet.'
export const UNSOURCED_COLOUR = '#5c5a57'

export async function getEvidenceTypes(): Promise<EvidenceTypeMap> {
  const { data } = await supabase.from('evidence_types').select('*').order('strength_rank')
  if (!data) return {}
  return Object.fromEntries((data as EvidenceType[]).map(e => [e.id, e]))
}

export type SourceMaterialStub = { id: string; title: string; year: string | null }

export interface ResolvedCitation {
  id: string
  field_name: string | null
  source_type: string        // SCT ref ID
  text_excerpt: string | null
  page_reference: string | null
  source_material_id: string | null
  source_material: SourceMaterialStub | null
  inherited_from_model_id: string | null
  inherited_from_generation: string | null
  guitar_ids: string[] | null
}

// field_name -> citations, for the universal (model_specifications) layer
export type FieldCitations = Record<string, ResolvedCitation[]>
// gen_spec_id -> field_name -> citations, for the generation layer
export type GenFieldCitations = Record<string, FieldCitations>

type RawRow = {
  id: string
  field_name: string | null
  source_type: string
  text_excerpt: string | null
  page_reference: string | null
  source_material_id: string | null
  inherited_from_model_id: string | null
  inherited_from_generation: string | null
  guitar_ids: string[] | null
  source_materials: SourceMaterialStub | null
}

function toResolvedCitation(row: RawRow): ResolvedCitation {
  const { source_materials, ...rest } = row
  return { ...rest, source_material: source_materials ?? null }
}

const CITATION_COLUMNS = 'id, field_name, source_type, text_excerpt, page_reference, source_material_id, inherited_from_model_id, inherited_from_generation, guitar_ids, source_materials(id, title, year)'

// All citations for a model's universal spec layer, grouped by field_name
export async function getModelFieldCitations(specId: string): Promise<FieldCitations> {
  const { data } = await supabase
    .from('model_spec_sources')
    .select(CITATION_COLUMNS)
    .eq('spec_id', specId)

  const result: FieldCitations = {}
  for (const row of (data ?? []) as unknown as RawRow[]) {
    if (!row.field_name) continue
    const list = result[row.field_name] ?? (result[row.field_name] = [])
    list.push(toResolvedCitation(row))
  }
  return result
}

// All citations across a set of gen specs, grouped by gen_spec_id then field_name
export async function getGenFieldCitations(genSpecIds: string[]): Promise<GenFieldCitations> {
  if (genSpecIds.length === 0) return {}
  const { data } = await supabase
    .from('model_gen_spec_sources')
    .select(`gen_spec_id, ${CITATION_COLUMNS}`)
    .in('gen_spec_id', genSpecIds)

  const result: GenFieldCitations = {}
  for (const row of (data ?? []) as unknown as (RawRow & { gen_spec_id: string })[]) {
    if (!row.field_name) continue
    const bucket = result[row.gen_spec_id] ?? (result[row.gen_spec_id] = {})
    const list = bucket[row.field_name] ?? (bucket[row.field_name] = [])
    list.push(toResolvedCitation(row))
  }
  return result
}

export function flattenFieldCitations(fc: FieldCitations): ResolvedCitation[] {
  return Object.values(fc).flat()
}

export function flattenGenFieldCitations(gfc: GenFieldCitations): ResolvedCitation[] {
  return Object.values(gfc).flatMap(flattenFieldCitations)
}

// Distinct guitar UUIDs referenced by a set of citations (registry_guitar links)
export function collectGuitarIds(citations: ResolvedCitation[]): string[] {
  return [...new Set(citations.flatMap(c => c.guitar_ids ?? []))]
}

// Distinct parent-model UUIDs referenced by "Inherited" citations (parent_model links)
export function collectParentModelIds(citations: ResolvedCitation[]): string[] {
  return [...new Set(citations.map(c => c.inherited_from_model_id).filter((id): id is string => id != null))]
}

// Resolve guitar UUIDs to their public MGR id, for /guitar/[mgr_id] links
export async function getGuitarMgrIdMap(guitarIds: string[]): Promise<Record<string, number>> {
  if (guitarIds.length === 0) return {}
  const { data } = await supabase.from('guitars').select('id, mgr_id').in('id', guitarIds)
  if (!data) return {}
  return Object.fromEntries((data as { id: string; mgr_id: number }[]).map(g => [g.id, g.mgr_id]))
}

// Resolve parent model UUIDs to their model name, for /models/[slug] links
export async function getParentModelMap(modelIds: string[]): Promise<Record<string, { model: string }>> {
  if (modelIds.length === 0) return {}
  const { data } = await supabase.from('model_specifications').select('id, model').in('id', modelIds)
  if (!data) return {}
  return Object.fromEntries((data as { id: string; model: string }[]).map(m => [m.id, { model: m.model }]))
}

// A field's citations bucketed by evidence type, ordered by strength_rank — the shape the icon cluster renders from
export interface EvidenceGroup {
  evidenceType: EvidenceType
  citations: ResolvedCitation[]
}

export function groupByEvidenceType(citations: ResolvedCitation[], evidenceTypes: EvidenceTypeMap): EvidenceGroup[] {
  const buckets = new Map<string, ResolvedCitation[]>()
  for (const c of citations) {
    const list = buckets.get(c.source_type) ?? []
    list.push(c)
    buckets.set(c.source_type, list)
  }
  return [...buckets.entries()]
    .map(([sourceType, cs]) => ({ evidenceType: evidenceTypes[sourceType], citations: cs }))
    .filter((g): g is EvidenceGroup => Boolean(g.evidenceType))
    .sort((a, b) => a.evidenceType.strength_rank - b.evidenceType.strength_rank)
}

// Resolved lookups needed to turn a citation into a link — gathered once per page via
// getGuitarMgrIdMap / getParentModelMap / getRefValues, then reused for every field's cluster.
export interface EvidenceLinkContext {
  guitarMgrMap: Record<string, number>
  parentModelMap: Record<string, { model: string }>
  refMap: Record<string, string>
}

// One renderable line inside a citation panel — either a link (to the archive, a registry
// guitar, or a parent model) or, when no link target is possible, a plain description.
export interface PanelLine {
  key: string
  label: string
  href: string | null
  excerpt: string | null
}

export interface ClusterGroup {
  evidenceType: EvidenceType
  count: number           // number of citations of this type (for the cluster's count badge)
  lines: PanelLine[]       // panel lines — registry_guitar citations expand to one line per guitar
}

const slugifyModel = (model: string) => model.toLowerCase().replace(/\s+/g, '-')

function citationToLines(c: ResolvedCitation, et: EvidenceType, ctx: EvidenceLinkContext): PanelLine[] {
  if (et.link_target === 'registry_guitar') {
    const ids = c.guitar_ids ?? []
    if (ids.length === 0) return [{ key: c.id, label: et.description, href: null, excerpt: c.text_excerpt }]
    return ids.map(gid => {
      const mgrId = ctx.guitarMgrMap[gid]
      return {
        key: `${c.id}-${gid}`,
        label: mgrId != null ? `MGR-${String(mgrId).padStart(4, '0')}` : 'Registry guitar',
        href: mgrId != null ? `/guitar/${mgrId}` : null,
        excerpt: c.text_excerpt,
      }
    })
  }

  if (et.link_target === 'parent_model') {
    const parent = c.inherited_from_model_id ? ctx.parentModelMap[c.inherited_from_model_id] : null
    const genLabel = c.inherited_from_generation ? (ctx.refMap[c.inherited_from_generation] ?? c.inherited_from_generation) : null
    return [{
      key: c.id,
      label: parent ? `Inherited from ${parent.model}${genLabel ? ` (${genLabel})` : ''}` : et.description,
      href: parent ? `/models/${slugifyModel(parent.model)}` : null,
      excerpt: c.text_excerpt,
    }]
  }

  if (et.link_target === 'archive_source') {
    const sm = c.source_material
    const label = sm
      ? `${sm.title}${sm.year ? ` (${sm.year})` : ''}${c.page_reference ? `, p.${c.page_reference}` : ''}`
      : et.description
    return [{
      key: c.id,
      label,
      href: sm ? `/archive/sources/${sm.id}` : null,
      excerpt: c.text_excerpt,
    }]
  }

  // link_target === 'none'
  return [{ key: c.id, label: et.description, href: null, excerpt: c.text_excerpt }]
}

// Build the fully-resolved group/line data an EvidenceCluster renders from — one call per field.
export function buildClusterGroups(
  citations: ResolvedCitation[],
  evidenceTypes: EvidenceTypeMap,
  ctx: EvidenceLinkContext
): ClusterGroup[] {
  return groupByEvidenceType(citations, evidenceTypes).map(({ evidenceType, citations: cs }) => ({
    evidenceType,
    count: cs.length,
    lines: cs.flatMap(c => citationToLines(c, evidenceType, ctx)),
  }))
}
