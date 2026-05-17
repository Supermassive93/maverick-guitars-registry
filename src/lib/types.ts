export type BodyContouring = 'Full Maverick contouring' | 'Partial contouring' | 'No contouring'
export type SourceMaterialType = 'Catalogue' | 'Magazine' | 'Advertisement' | 'Receipt' | 'Photograph' | 'Video' | 'Audio' | 'Other'
export type ExtractionStatus = 'pending' | 'processing' | 'complete' | 'failed'
export type IndicatorStatus = 'draft' | 'confirmed' | 'retired'
export type IndicatorConfidence = 'Low' | 'Medium' | 'High'
export type ArticleType = 'Article' | 'Testimonial' | 'Interview' | 'News'

export type SerialStatus = 'Complete' | 'Partial' | 'Prefix only' | 'None Visible' | 'Paper label' | 'Hand label'
export type Series = 'F-Series' | 'X-Series' | 'X-Treme' | 'Species' | 'Chaos' | 'S-Series' | 'Streetfighter' | 'Matrix' | 'G-Series' | 'B-Series' | 'JR-Series' | 'Unknown'
export type Generation = 'Gen 1' | 'Gen 2' | 'Gen 3' | 'Pre-production' | 'Unknown'
export type FinishType = 'Factory Finish' | 'Custom Shop Finish' | 'Refinished' | 'Unknown'
export type GuitarStatus = 'Pending' | 'Approved' | 'Rejected' | 'Pre-populated'
export type SpecSource = 'Catalogue Confirmed' | 'Press Confirmed' | 'Registry Derived' | 'Owner Confirmed' | 'Unverified'

export interface Guitar {
  id: string
  mgr_id: number
  user_id: string | null
  serial: string | null
  serial_number_only: number | null
  serial_status: SerialStatus | null
  series: Series | null
  model: string | null
  generation: Generation | null
  finish_type: FinishType | null
  factory_colour: string | null
  custom_shop_colour: string | null
  catalogue_year: string | null
  body_shape_analogue: string | null
  body_wood: string | null
  pickup_configuration: string | null
  neck_pickup: string | null
  middle_pickup: string | null
  bridge_pickup: string | null
  bridge_configuration: string | null
  hardware_colour: string | null
  headstock_face: string | null
  headstock_style: string | null
  headstock_logo: string | null
  bridge_logo: string | null
  pickup_surrounds: string | null
  pickup_colours: string | null
  tuner_style: string | null
  neck_binding: string | null
  switch_type: string | null
  switch_knob: string | null
  potentiometers: string | null
  whammy_bar: string | null
  fret_count: string | null
  fretboard_wood: string | null
  scale_length: string | null
  neck_construction: string | null
  skunk_stripe: string | null
  headstock_break_angle: number | null
  neck_pitch: number | null
  specification_source: SpecSource | null
  source_type: string | null
  source_url: string | null
  last_known_country: string | null
  last_known_region: string | null
  last_known_city: string | null
  last_price: number | null
  original_rrp: number | null
  left_handed: string | null
  date_submitted: string | null
  date_approved: string | null
  last_updated: string | null
  verified_by: string | null
  image_urls: string[] | null
  primary_image_url: string | null
  status: GuitarStatus
  admin_notes: string | null
  submission_notes: string | null
  submitter_email: string | null
  registered_by: string | null
}

export interface CatalogueModel {
  id: string
  catalogue_year: string
  model: string
  series: string | null
  available_colours: string[] | null
  pickup_configuration: string | null
  bridge_type: string | null
  body_wood: string | null
  neck_wood: string | null
  fretboard_wood: string | null
  neck_profile: string | null
  neck_construction: string | null
  fret_count: string | null
  scale_length: string | null
  hardware_colour: string | null
  pickup_surrounds: string | null
  pickup_colour: string | null
  pickup_covers: string | null
  switch_type: string | null
  potentiometers: string | null
  locking_nut: string | null
  headstock_style: string | null
  headstock_face: string | null
  headstock_logo: string | null
  string_count: string | null
  body_shape_analogue: string | null
  body_contouring: BodyContouring | null
  fret_markers: string | null
  left_handed_available: boolean | null
  original_rrp: number | null
  left_handed_rrp: number | null
  notes: string | null
  source: string | null
  created_at: string | null
}

export interface ModelSpec {
  id: string
  model: string
  series: Series | null
  serial_prefix: string | null
  catalogue_year: string | null
  body_shape_analogue: string | null
  body_wood: string | null
  neck_wood: string | null
  fretboard_wood: string | null
  neck_profile: string | null
  neck_construction: string | null
  fret_count: string | null
  scale_length: string | null
  pickup_configuration: string | null
  bridge_type: string | null
  potentiometers: string | null
  switch_type: string | null
  left_handed_available: string | null
  original_rrp: number | null
  left_handed_rrp: number | null
  specification_source: SpecSource | null
  catalogue_page: string | null
  press_references: string | null
  notes: string | null
}

export interface Profile {
  id: string
  username: string | null
  created_at: string | null
}

export interface SourceMaterial {
  id: string
  title: string
  material_type: SourceMaterialType
  year: string | null
  description: string | null
  file_url: string | null
  thumbnail_url: string | null
  source_credit: string | null
  notes: string | null
  extracted_text: string | null
  page_count: number | null
  extraction_status: ExtractionStatus
  is_published: boolean
  created_at: string | null
}

export interface GenerationIndicator {
  id: string
  feature: string
  feature_value: string
  generation: string
  model: string | null
  series: string | null
  status: IndicatorStatus
  confidence: IndicatorConfidence | null
  notes: string | null
  created_at: string | null
}

export interface GenerationIndicatorSource {
  id: string
  indicator_id: string
  source_material_id: string
  text_excerpt: string | null
  page_reference: string | null
  created_at: string | null
}

export interface Article {
  id: string
  title: string
  slug: string
  content: string | null
  excerpt: string | null
  author: string | null
  article_type: ArticleType
  is_published: boolean
  published_at: string | null
  created_at: string | null
  updated_at: string | null
}

export interface Database {
  public: {
    Tables: {
      guitars: {
        Row: Guitar
        Insert: Omit<Guitar, 'id' | 'mgr_id' | 'date_submitted' | 'last_updated'>
        Update: Partial<Omit<Guitar, 'id' | 'mgr_id'>>
      }
      model_specifications: {
        Row: ModelSpec
        Insert: Omit<ModelSpec, 'id'>
        Update: Partial<Omit<ModelSpec, 'id'>>
      }
      catalogue_models: {
        Row: CatalogueModel
        Insert: Omit<CatalogueModel, 'id' | 'created_at'>
        Update: Partial<Omit<CatalogueModel, 'id' | 'created_at'>>
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      source_materials: {
        Row: SourceMaterial
        Insert: Omit<SourceMaterial, 'id' | 'created_at'>
        Update: Partial<Omit<SourceMaterial, 'id' | 'created_at'>>
      }
      articles: {
        Row: Article
        Insert: Omit<Article, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Article, 'id' | 'created_at'>>
      }
      generation_indicators: {
        Row: GenerationIndicator
        Insert: Omit<GenerationIndicator, 'id' | 'created_at'>
        Update: Partial<Omit<GenerationIndicator, 'id' | 'created_at'>>
      }
      generation_indicator_sources: {
        Row: GenerationIndicatorSource
        Insert: Omit<GenerationIndicatorSource, 'id' | 'created_at'>
        Update: Partial<Omit<GenerationIndicatorSource, 'id' | 'created_at'>>
      }
    }
  }
}
