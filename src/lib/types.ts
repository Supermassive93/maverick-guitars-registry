export type SerialStatus = 'Complete' | 'Partial' | 'Prefix only' | 'None Visible'
export type Series = 'F-Series' | 'X-Series' | 'Species' | 'Chaos' | 'S-Series' | 'Streetfighter' | 'Matrix' | 'G-Series' | 'B-Series' | 'Unknown'
export type Generation = 'Gen 1' | 'Gen 2' | 'Gen 3' | 'Unknown'
export type FinishType = 'Factory Finish' | 'Custom Shop Finish' | 'Refinished' | 'Unknown'
export type GuitarStatus = 'Pending' | 'Approved' | 'Rejected'
export type SpecSource = 'Catalogue Confirmed' | 'Press Confirmed' | 'Registry Derived' | 'Owner Confirmed' | 'Unverified'

export interface Guitar {
  id: string
  mgr_id: number
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
  headstock_logo: string | null
  bridge_logo: string | null
  pickup_surrounds: string | null
  neck_binding: string | null
  switch_type: string | null
  switch_knob: string | null
  potentiometers: string | null
  whammy_bar: string | null
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
  submission_notes: string | null
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
    }
  }
}
