export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          article_type: string
          author: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          is_published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          article_type: string
          author?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          article_type?: string
          author?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bass_pickup_configuration_map: {
        Row: {
          bridge_type: string | null
          configuration: string
          id: string
          middle_type: string | null
          neck_type: string | null
          notes: string | null
        }
        Insert: {
          bridge_type?: string | null
          configuration: string
          id?: string
          middle_type?: string | null
          neck_type?: string | null
          notes?: string | null
        }
        Update: {
          bridge_type?: string | null
          configuration?: string
          id?: string
          middle_type?: string | null
          neck_type?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      bridge_categories: {
        Row: {
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      component_implied_specs: {
        Row: {
          component_id: string
          created_at: string | null
          id: string
          implied_field: string
          implied_value: string
          notes: string | null
          source_material_id: string | null
        }
        Insert: {
          component_id: string
          created_at?: string | null
          id?: string
          implied_field: string
          implied_value: string
          notes?: string | null
          source_material_id?: string | null
        }
        Update: {
          component_id?: string
          created_at?: string | null
          id?: string
          implied_field?: string
          implied_value?: string
          notes?: string | null
          source_material_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "component_implied_specs_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "component_implied_specs_source_material_id_fkey"
            columns: ["source_material_id"]
            isOneToOne: false
            referencedRelation: "source_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      components: {
        Row: {
          created_at: string | null
          id: string
          name: string
          notes: string | null
          trigger_field: string
          trigger_field_2: string | null
          trigger_value: string
          trigger_value_2: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          trigger_field: string
          trigger_field_2?: string | null
          trigger_value: string
          trigger_value_2?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          trigger_field?: string
          trigger_field_2?: string | null
          trigger_value?: string
          trigger_value_2?: string | null
        }
        Relationships: []
      }
      contributions: {
        Row: {
          admin_notes: string | null
          contribution_type: string
          created_at: string | null
          description: string | null
          email: string
          external_url: string | null
          id: string
          name: string | null
          status: string
          title: string
        }
        Insert: {
          admin_notes?: string | null
          contribution_type: string
          created_at?: string | null
          description?: string | null
          email: string
          external_url?: string | null
          id?: string
          name?: string | null
          status?: string
          title: string
        }
        Update: {
          admin_notes?: string | null
          contribution_type?: string
          created_at?: string | null
          description?: string | null
          email?: string
          external_url?: string | null
          id?: string
          name?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      evidence_types: {
        Row: {
          colour: string
          created_at: string | null
          description: string
          icon: string
          id: string
          label: string
          link_target: string
          strength_rank: number
          style: string
        }
        Insert: {
          colour: string
          created_at?: string | null
          description: string
          icon: string
          id: string
          label: string
          link_target: string
          strength_rank: number
          style: string
        }
        Update: {
          colour?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          label?: string
          link_target?: string
          strength_rank?: number
          style?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_types_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "ref_values"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_indicator_sources: {
        Row: {
          created_at: string | null
          id: string
          indicator_id: string
          page_reference: string | null
          source_material_id: string
          text_excerpt: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          indicator_id: string
          page_reference?: string | null
          source_material_id: string
          text_excerpt?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          indicator_id?: string
          page_reference?: string | null
          source_material_id?: string
          text_excerpt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generation_indicator_sources_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "generation_indicators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_indicator_sources_source_material_id_fkey"
            columns: ["source_material_id"]
            isOneToOne: false
            referencedRelation: "source_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_indicators: {
        Row: {
          confidence: string | null
          created_at: string | null
          feature: string
          feature_value: string
          generation: string
          id: string
          model: string | null
          notes: string | null
          series: string | null
          status: string | null
        }
        Insert: {
          confidence?: string | null
          created_at?: string | null
          feature: string
          feature_value: string
          generation: string
          id?: string
          model?: string | null
          notes?: string | null
          series?: string | null
          status?: string | null
        }
        Update: {
          confidence?: string | null
          created_at?: string | null
          feature?: string
          feature_value?: string
          generation?: string
          id?: string
          model?: string | null
          notes?: string | null
          series?: string | null
          status?: string | null
        }
        Relationships: []
      }
      guitars: {
        Row: {
          admin_notes: string | null
          body_bookmatched: string | null
          body_construction: string | null
          body_shape_analogue: string | null
          body_wood: string | null
          bridge_logo: string | null
          bridge_pickup: string | null
          bridge_type: string | null
          catalogue_year: string | null
          custom_shop_colour: string | null
          date_approved: string | null
          date_submitted: string | null
          factory_colour: string | null
          finish_type: string | null
          fret_count: string | null
          fretboard_wood: string | null
          generation: string | null
          hardware_colour: string | null
          headstock_break_angle: number | null
          headstock_face: string | null
          headstock_logo: string | null
          headstock_style: string | null
          id: string
          image_urls: string[] | null
          instrument_type: string | null
          last_known_city: string | null
          last_known_country: string | null
          last_known_region: string | null
          last_price: number | null
          last_updated: string | null
          left_handed_available: string | null
          mgr_id: number
          middle_pickup: string | null
          model_id: string
          neck_binding: string | null
          neck_construction: string | null
          neck_pickup: string | null
          neck_pitch: number | null
          neck_profile: string | null
          neck_wood: string | null
          nut_type: string | null
          original_rrp: number | null
          pickup_colours: string | null
          pickup_configuration: string | null
          pickup_surrounds: string | null
          potentiometers: string | null
          primary_image_url: string | null
          registered_by: string | null
          scale_length: string | null
          serial: string | null
          serial_number_only: number | null
          serial_status: string | null
          series: string | null
          skunk_stripe: string | null
          source_type: string | null
          source_url: string | null
          specification_source: string | null
          status: string | null
          submission_notes: string | null
          submitter_email: string | null
          switch_knob: string | null
          switch_type: string | null
          tuner_style: string | null
          user_id: string | null
          verified_by: string | null
          whammy_bar: string | null
        }
        Insert: {
          admin_notes?: string | null
          body_bookmatched?: string | null
          body_construction?: string | null
          body_shape_analogue?: string | null
          body_wood?: string | null
          bridge_logo?: string | null
          bridge_pickup?: string | null
          bridge_type?: string | null
          catalogue_year?: string | null
          custom_shop_colour?: string | null
          date_approved?: string | null
          date_submitted?: string | null
          factory_colour?: string | null
          finish_type?: string | null
          fret_count?: string | null
          fretboard_wood?: string | null
          generation?: string | null
          hardware_colour?: string | null
          headstock_break_angle?: number | null
          headstock_face?: string | null
          headstock_logo?: string | null
          headstock_style?: string | null
          id?: string
          image_urls?: string[] | null
          instrument_type?: string | null
          last_known_city?: string | null
          last_known_country?: string | null
          last_known_region?: string | null
          last_price?: number | null
          last_updated?: string | null
          left_handed_available?: string | null
          mgr_id?: number
          middle_pickup?: string | null
          model_id: string
          neck_binding?: string | null
          neck_construction?: string | null
          neck_pickup?: string | null
          neck_pitch?: number | null
          neck_profile?: string | null
          neck_wood?: string | null
          nut_type?: string | null
          original_rrp?: number | null
          pickup_colours?: string | null
          pickup_configuration?: string | null
          pickup_surrounds?: string | null
          potentiometers?: string | null
          primary_image_url?: string | null
          registered_by?: string | null
          scale_length?: string | null
          serial?: string | null
          serial_number_only?: number | null
          serial_status?: string | null
          series?: string | null
          skunk_stripe?: string | null
          source_type?: string | null
          source_url?: string | null
          specification_source?: string | null
          status?: string | null
          submission_notes?: string | null
          submitter_email?: string | null
          switch_knob?: string | null
          switch_type?: string | null
          tuner_style?: string | null
          user_id?: string | null
          verified_by?: string | null
          whammy_bar?: string | null
        }
        Update: {
          admin_notes?: string | null
          body_bookmatched?: string | null
          body_construction?: string | null
          body_shape_analogue?: string | null
          body_wood?: string | null
          bridge_logo?: string | null
          bridge_pickup?: string | null
          bridge_type?: string | null
          catalogue_year?: string | null
          custom_shop_colour?: string | null
          date_approved?: string | null
          date_submitted?: string | null
          factory_colour?: string | null
          finish_type?: string | null
          fret_count?: string | null
          fretboard_wood?: string | null
          generation?: string | null
          hardware_colour?: string | null
          headstock_break_angle?: number | null
          headstock_face?: string | null
          headstock_logo?: string | null
          headstock_style?: string | null
          id?: string
          image_urls?: string[] | null
          instrument_type?: string | null
          last_known_city?: string | null
          last_known_country?: string | null
          last_known_region?: string | null
          last_price?: number | null
          last_updated?: string | null
          left_handed_available?: string | null
          mgr_id?: number
          middle_pickup?: string | null
          model_id?: string
          neck_binding?: string | null
          neck_construction?: string | null
          neck_pickup?: string | null
          neck_pitch?: number | null
          neck_profile?: string | null
          neck_wood?: string | null
          nut_type?: string | null
          original_rrp?: number | null
          pickup_colours?: string | null
          pickup_configuration?: string | null
          pickup_surrounds?: string | null
          potentiometers?: string | null
          primary_image_url?: string | null
          registered_by?: string | null
          scale_length?: string | null
          serial?: string | null
          serial_number_only?: number | null
          serial_status?: string | null
          series?: string | null
          skunk_stripe?: string | null
          source_type?: string | null
          source_url?: string | null
          specification_source?: string | null
          status?: string | null
          submission_notes?: string | null
          submitter_email?: string | null
          switch_knob?: string | null
          switch_type?: string | null
          tuner_style?: string | null
          user_id?: string | null
          verified_by?: string | null
          whammy_bar?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guitars_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "model_specifications"
            referencedColumns: ["id"]
          },
        ]
      }
      inference_sources: {
        Row: {
          created_at: string
          id: string
          inference_id: string
          note: string | null
          source_material_id: string
          source_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          inference_id: string
          note?: string | null
          source_material_id: string
          source_type: string
        }
        Update: {
          created_at?: string
          id?: string
          inference_id?: string
          note?: string | null
          source_material_id?: string
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "inference_sources_inference_id_fkey"
            columns: ["inference_id"]
            isOneToOne: false
            referencedRelation: "inferences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inference_sources_source_material_id_fkey"
            columns: ["source_material_id"]
            isOneToOne: false
            referencedRelation: "source_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inference_sources_source_type_fkey"
            columns: ["source_type"]
            isOneToOne: false
            referencedRelation: "evidence_types"
            referencedColumns: ["id"]
          },
        ]
      }
      inferences: {
        Row: {
          created_at: string
          explanation: string
          id: string
          inference_number: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explanation: string
          id?: string
          inference_number?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explanation?: string
          id?: string
          inference_number?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      model_appearances: {
        Row: {
          appears_in: boolean
          created_at: string
          id: string
          model_id: string
          notes: string | null
          source_material_id: string
        }
        Insert: {
          appears_in?: boolean
          created_at?: string
          id?: string
          model_id: string
          notes?: string | null
          source_material_id: string
        }
        Update: {
          appears_in?: boolean
          created_at?: string
          id?: string
          model_id?: string
          notes?: string | null
          source_material_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_appearances_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "model_specifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_appearances_source_material_id_fkey"
            columns: ["source_material_id"]
            isOneToOne: false
            referencedRelation: "source_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      model_gen_spec_sources: {
        Row: {
          created_at: string | null
          field_name: string | null
          gen_spec_id: string
          guitar_ids: string[] | null
          id: string
          inference_id: string | null
          inherited_from_generation: string | null
          inherited_from_model_id: string | null
          page_reference: string | null
          source_material_id: string | null
          source_type: string
          text_excerpt: string | null
        }
        Insert: {
          created_at?: string | null
          field_name?: string | null
          gen_spec_id: string
          guitar_ids?: string[] | null
          id?: string
          inference_id?: string | null
          inherited_from_generation?: string | null
          inherited_from_model_id?: string | null
          page_reference?: string | null
          source_material_id?: string | null
          source_type?: string
          text_excerpt?: string | null
        }
        Update: {
          created_at?: string | null
          field_name?: string | null
          gen_spec_id?: string
          guitar_ids?: string[] | null
          id?: string
          inference_id?: string | null
          inherited_from_generation?: string | null
          inherited_from_model_id?: string | null
          page_reference?: string | null
          source_material_id?: string | null
          source_type?: string
          text_excerpt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_gen_spec_source_type"
            columns: ["source_type"]
            isOneToOne: false
            referencedRelation: "ref_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_gen_spec_sources_gen_spec_id_fkey"
            columns: ["gen_spec_id"]
            isOneToOne: false
            referencedRelation: "model_gen_specs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_gen_spec_sources_inference_id_fkey"
            columns: ["inference_id"]
            isOneToOne: false
            referencedRelation: "inferences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_gen_spec_sources_inherited_from_generation_fkey"
            columns: ["inherited_from_generation"]
            isOneToOne: false
            referencedRelation: "ref_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_gen_spec_sources_inherited_from_model_id_fkey"
            columns: ["inherited_from_model_id"]
            isOneToOne: false
            referencedRelation: "model_specifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_gen_spec_sources_source_material_id_fkey"
            columns: ["source_material_id"]
            isOneToOne: false
            referencedRelation: "source_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      model_gen_specs: {
        Row: {
          available_colours: string[] | null
          binding_colour: string | null
          body_binding: string | null
          body_construction: string | null
          body_shape_analogue: string | null
          body_wood: string | null
          bridge_logo: string | null
          bridge_pickup: string | null
          bridge_type: string | null
          created_at: string
          fret_count: string | null
          fretboard_marker_colour: string | null
          fretboard_markers: string | null
          fretboard_wood: string | null
          generation: string
          hardware_colour: string | null
          headstock_binding: string | null
          headstock_face: string | null
          headstock_logo: string | null
          headstock_style: string | null
          headstock_trademark: string | null
          id: string
          jack_socket: string | null
          left_handed_available: string | null
          left_handed_rrp: number | null
          middle_pickup: string | null
          model_id: string
          neck_binding: string | null
          neck_construction: string | null
          neck_finish: string | null
          neck_pickup: string | null
          neck_profile: string | null
          neck_wood: string | null
          notes: string | null
          nut_type: string | null
          original_rrp: number | null
          pickup_colours: string | null
          pickup_configuration: string | null
          pickup_surrounds: string | null
          potentiometers: string | null
          production_year_end: number | null
          production_year_start: number | null
          scale_length: string | null
          serial_number_style: string | null
          side_dot_colour: string | null
          side_dot_markers: string | null
          skunk_stripe: string | null
          spec_options: Json | null
          switch_knob: string | null
          switch_type: string | null
          trem_arm: string | null
          tremolo_cover_routing: string | null
          truss_rod: string | null
          truss_rod_cover: string | null
          tuner_style: string | null
          updated_at: string
        }
        Insert: {
          available_colours?: string[] | null
          binding_colour?: string | null
          body_binding?: string | null
          body_construction?: string | null
          body_shape_analogue?: string | null
          body_wood?: string | null
          bridge_logo?: string | null
          bridge_pickup?: string | null
          bridge_type?: string | null
          created_at?: string
          fret_count?: string | null
          fretboard_marker_colour?: string | null
          fretboard_markers?: string | null
          fretboard_wood?: string | null
          generation: string
          hardware_colour?: string | null
          headstock_binding?: string | null
          headstock_face?: string | null
          headstock_logo?: string | null
          headstock_style?: string | null
          headstock_trademark?: string | null
          id?: string
          jack_socket?: string | null
          left_handed_available?: string | null
          left_handed_rrp?: number | null
          middle_pickup?: string | null
          model_id: string
          neck_binding?: string | null
          neck_construction?: string | null
          neck_finish?: string | null
          neck_pickup?: string | null
          neck_profile?: string | null
          neck_wood?: string | null
          notes?: string | null
          nut_type?: string | null
          original_rrp?: number | null
          pickup_colours?: string | null
          pickup_configuration?: string | null
          pickup_surrounds?: string | null
          potentiometers?: string | null
          production_year_end?: number | null
          production_year_start?: number | null
          scale_length?: string | null
          serial_number_style?: string | null
          side_dot_colour?: string | null
          side_dot_markers?: string | null
          skunk_stripe?: string | null
          spec_options?: Json | null
          switch_knob?: string | null
          switch_type?: string | null
          trem_arm?: string | null
          tremolo_cover_routing?: string | null
          truss_rod?: string | null
          truss_rod_cover?: string | null
          tuner_style?: string | null
          updated_at?: string
        }
        Update: {
          available_colours?: string[] | null
          binding_colour?: string | null
          body_binding?: string | null
          body_construction?: string | null
          body_shape_analogue?: string | null
          body_wood?: string | null
          bridge_logo?: string | null
          bridge_pickup?: string | null
          bridge_type?: string | null
          created_at?: string
          fret_count?: string | null
          fretboard_marker_colour?: string | null
          fretboard_markers?: string | null
          fretboard_wood?: string | null
          generation?: string
          hardware_colour?: string | null
          headstock_binding?: string | null
          headstock_face?: string | null
          headstock_logo?: string | null
          headstock_style?: string | null
          headstock_trademark?: string | null
          id?: string
          jack_socket?: string | null
          left_handed_available?: string | null
          left_handed_rrp?: number | null
          middle_pickup?: string | null
          model_id?: string
          neck_binding?: string | null
          neck_construction?: string | null
          neck_finish?: string | null
          neck_pickup?: string | null
          neck_profile?: string | null
          neck_wood?: string | null
          notes?: string | null
          nut_type?: string | null
          original_rrp?: number | null
          pickup_colours?: string | null
          pickup_configuration?: string | null
          pickup_surrounds?: string | null
          potentiometers?: string | null
          production_year_end?: number | null
          production_year_start?: number | null
          scale_length?: string | null
          serial_number_style?: string | null
          side_dot_colour?: string | null
          side_dot_markers?: string | null
          skunk_stripe?: string | null
          spec_options?: Json | null
          switch_knob?: string | null
          switch_type?: string | null
          trem_arm?: string | null
          tremolo_cover_routing?: string | null
          truss_rod?: string | null
          truss_rod_cover?: string | null
          tuner_style?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_gen_specs_binding_colour_fkey"
            columns: ["binding_colour"]
            isOneToOne: false
            referencedRelation: "ref_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_gen_specs_body_binding_fkey"
            columns: ["body_binding"]
            isOneToOne: false
            referencedRelation: "ref_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_gen_specs_bridge_pickup_fkey"
            columns: ["bridge_pickup"]
            isOneToOne: false
            referencedRelation: "ref_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_gen_specs_fretboard_marker_colour_fkey"
            columns: ["fretboard_marker_colour"]
            isOneToOne: false
            referencedRelation: "ref_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_gen_specs_fretboard_markers_fkey"
            columns: ["fretboard_markers"]
            isOneToOne: false
            referencedRelation: "ref_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_gen_specs_headstock_binding_fkey"
            columns: ["headstock_binding"]
            isOneToOne: false
            referencedRelation: "ref_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_gen_specs_jack_socket_fkey"
            columns: ["jack_socket"]
            isOneToOne: false
            referencedRelation: "ref_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_gen_specs_middle_pickup_fkey"
            columns: ["middle_pickup"]
            isOneToOne: false
            referencedRelation: "ref_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_gen_specs_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "model_specifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_gen_specs_neck_pickup_fkey"
            columns: ["neck_pickup"]
            isOneToOne: false
            referencedRelation: "ref_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_gen_specs_serial_number_style_fkey"
            columns: ["serial_number_style"]
            isOneToOne: false
            referencedRelation: "ref_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_gen_specs_side_dot_colour_fkey"
            columns: ["side_dot_colour"]
            isOneToOne: false
            referencedRelation: "ref_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_gen_specs_side_dot_markers_fkey"
            columns: ["side_dot_markers"]
            isOneToOne: false
            referencedRelation: "ref_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_gen_specs_tremolo_cover_routing_fkey"
            columns: ["tremolo_cover_routing"]
            isOneToOne: false
            referencedRelation: "ref_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_gen_specs_truss_rod_cover_fkey"
            columns: ["truss_rod_cover"]
            isOneToOne: false
            referencedRelation: "ref_values"
            referencedColumns: ["id"]
          },
        ]
      }
      model_photo_appearances: {
        Row: {
          created_at: string
          generation: string | null
          id: string
          model_id: string | null
          notes: string | null
          source_material_id: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          generation?: string | null
          id?: string
          model_id?: string | null
          notes?: string | null
          source_material_id: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          generation?: string | null
          id?: string
          model_id?: string | null
          notes?: string | null
          source_material_id?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_photo_appearances_generation_fkey"
            columns: ["generation"]
            isOneToOne: false
            referencedRelation: "ref_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_photo_appearances_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "model_specifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_photo_appearances_source_material_id_fkey"
            columns: ["source_material_id"]
            isOneToOne: false
            referencedRelation: "source_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      model_pickup_years: {
        Row: {
          bridge_pickup: string | null
          created_at: string | null
          id: string
          middle_pickup: string | null
          model_id: string
          neck_pickup: string | null
          source_material_id: string
          year: string | null
        }
        Insert: {
          bridge_pickup?: string | null
          created_at?: string | null
          id?: string
          middle_pickup?: string | null
          model_id: string
          neck_pickup?: string | null
          source_material_id: string
          year?: string | null
        }
        Update: {
          bridge_pickup?: string | null
          created_at?: string | null
          id?: string
          middle_pickup?: string | null
          model_id?: string
          neck_pickup?: string | null
          source_material_id?: string
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_pickup_years_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "model_specifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_pickup_years_source_material_id_fkey"
            columns: ["source_material_id"]
            isOneToOne: false
            referencedRelation: "source_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      model_source_colours: {
        Row: {
          available_colours: string[]
          available_custom_shop_colours: string[] | null
          available_custom_shop_pickup_colours: string[] | null
          available_hardware_colours: string[] | null
          available_pickup_colours: string[] | null
          created_at: string | null
          id: string
          model_id: string
          notes: string | null
          source_material_id: string
          year_qualifier: string | null
        }
        Insert: {
          available_colours?: string[]
          available_custom_shop_colours?: string[] | null
          available_custom_shop_pickup_colours?: string[] | null
          available_hardware_colours?: string[] | null
          available_pickup_colours?: string[] | null
          created_at?: string | null
          id?: string
          model_id: string
          notes?: string | null
          source_material_id: string
          year_qualifier?: string | null
        }
        Update: {
          available_colours?: string[]
          available_custom_shop_colours?: string[] | null
          available_custom_shop_pickup_colours?: string[] | null
          available_hardware_colours?: string[] | null
          available_pickup_colours?: string[] | null
          created_at?: string | null
          id?: string
          model_id?: string
          notes?: string | null
          source_material_id?: string
          year_qualifier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_source_colours_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "model_specifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_source_colours_source_material_id_fkey"
            columns: ["source_material_id"]
            isOneToOne: false
            referencedRelation: "source_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      model_spec_sources: {
        Row: {
          created_at: string | null
          field_name: string | null
          field_value: string | null
          guitar_ids: string[] | null
          id: string
          inference_id: string | null
          inherited_from_generation: string | null
          inherited_from_model_id: string | null
          page_reference: string | null
          source_material_id: string | null
          source_type: string
          spec_id: string
          text_excerpt: string | null
        }
        Insert: {
          created_at?: string | null
          field_name?: string | null
          field_value?: string | null
          guitar_ids?: string[] | null
          id?: string
          inference_id?: string | null
          inherited_from_generation?: string | null
          inherited_from_model_id?: string | null
          page_reference?: string | null
          source_material_id?: string | null
          source_type?: string
          spec_id: string
          text_excerpt?: string | null
        }
        Update: {
          created_at?: string | null
          field_name?: string | null
          field_value?: string | null
          guitar_ids?: string[] | null
          id?: string
          inference_id?: string | null
          inherited_from_generation?: string | null
          inherited_from_model_id?: string | null
          page_reference?: string | null
          source_material_id?: string | null
          source_type?: string
          spec_id?: string
          text_excerpt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_spec_source_type"
            columns: ["source_type"]
            isOneToOne: false
            referencedRelation: "ref_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_spec_sources_inference_id_fkey"
            columns: ["inference_id"]
            isOneToOne: false
            referencedRelation: "inferences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_spec_sources_inherited_from_generation_fkey"
            columns: ["inherited_from_generation"]
            isOneToOne: false
            referencedRelation: "ref_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_spec_sources_inherited_from_model_id_fkey"
            columns: ["inherited_from_model_id"]
            isOneToOne: false
            referencedRelation: "model_specifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_spec_sources_source_material_id_fkey"
            columns: ["source_material_id"]
            isOneToOne: false
            referencedRelation: "source_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_spec_sources_spec_id_fkey"
            columns: ["spec_id"]
            isOneToOne: false
            referencedRelation: "model_specifications"
            referencedColumns: ["id"]
          },
        ]
      }
      model_specifications: {
        Row: {
          body_bookmatched: string | null
          body_carving: string | null
          body_construction: string | null
          body_decorative_routing: string | null
          body_shape_analogue: string | null
          body_wood: string | null
          bridge_pickup: string | null
          bridge_type: string | null
          catalogue_page: string | null
          catalogue_year: string | null
          coil_tap: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          eq_circuitry: string | null
          fret_count: string | null
          fretboard_markers: string | null
          fretboard_radius_mm: number | null
          fretboard_wood: string | null
          hardware_colour: string | null
          headstock_binding: string | null
          headstock_decorative_routing: string | null
          headstock_face: string | null
          headstock_logo: string | null
          headstock_style: string | null
          id: string
          joint_type: string | null
          left_handed_available: string | null
          left_handed_rrp: number | null
          maverick_body_family: string | null
          middle_pickup: string | null
          model: string
          neck_binding: string | null
          neck_construction: string | null
          neck_mount: string | null
          neck_pickup: string | null
          neck_profile: string | null
          neck_wood: string | null
          notes: string | null
          nut_type: string | null
          nut_width: number | null
          original_rrp: number | null
          parent_model_id: string | null
          pickup_colours: string | null
          pickup_configuration: string | null
          pickup_surrounds: string | null
          potentiometers: string | null
          press_references: string | null
          production_type_id: string | null
          rarity: string | null
          scale_length: string | null
          serial_prefix: string | null
          series: string | null
          tile_synopsis: string | null
          side_dot_markers: string | null
          skunk_stripe: string | null
          specification_source: string | null
          string_count: number | null
          switch_knob: string | null
          switch_type: string | null
          tone_pot: string | null
          tone_pot_count: number | null
          truss_rod: string | null
          tuner_style: string | null
          updated_at: string | null
          volume_pot: string | null
          volume_pot_count: number | null
          weight_kg: number | null
        }
        Insert: {
          body_bookmatched?: string | null
          body_carving?: string | null
          body_construction?: string | null
          body_decorative_routing?: string | null
          body_shape_analogue?: string | null
          body_wood?: string | null
          bridge_pickup?: string | null
          bridge_type?: string | null
          catalogue_page?: string | null
          catalogue_year?: string | null
          coil_tap?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          eq_circuitry?: string | null
          fret_count?: string | null
          fretboard_markers?: string | null
          fretboard_radius_mm?: number | null
          fretboard_wood?: string | null
          hardware_colour?: string | null
          headstock_binding?: string | null
          headstock_decorative_routing?: string | null
          headstock_face?: string | null
          headstock_logo?: string | null
          headstock_style?: string | null
          id?: string
          joint_type?: string | null
          left_handed_available?: string | null
          left_handed_rrp?: number | null
          maverick_body_family?: string | null
          middle_pickup?: string | null
          model: string
          neck_binding?: string | null
          neck_construction?: string | null
          neck_mount?: string | null
          neck_pickup?: string | null
          neck_profile?: string | null
          neck_wood?: string | null
          notes?: string | null
          nut_type?: string | null
          nut_width?: number | null
          original_rrp?: number | null
          parent_model_id?: string | null
          pickup_colours?: string | null
          pickup_configuration?: string | null
          pickup_surrounds?: string | null
          potentiometers?: string | null
          press_references?: string | null
          production_type_id?: string | null
          rarity?: string | null
          scale_length?: string | null
          serial_prefix?: string | null
          series?: string | null
          tile_synopsis?: string | null
          side_dot_markers?: string | null
          skunk_stripe?: string | null
          specification_source?: string | null
          string_count?: number | null
          switch_knob?: string | null
          switch_type?: string | null
          tone_pot?: string | null
          tone_pot_count?: number | null
          truss_rod?: string | null
          tuner_style?: string | null
          updated_at?: string | null
          volume_pot?: string | null
          volume_pot_count?: number | null
          weight_kg?: number | null
        }
        Update: {
          body_bookmatched?: string | null
          body_carving?: string | null
          body_construction?: string | null
          body_decorative_routing?: string | null
          body_shape_analogue?: string | null
          body_wood?: string | null
          bridge_pickup?: string | null
          bridge_type?: string | null
          catalogue_page?: string | null
          catalogue_year?: string | null
          coil_tap?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          eq_circuitry?: string | null
          fret_count?: string | null
          fretboard_markers?: string | null
          fretboard_radius_mm?: number | null
          fretboard_wood?: string | null
          hardware_colour?: string | null
          headstock_binding?: string | null
          headstock_decorative_routing?: string | null
          headstock_face?: string | null
          headstock_logo?: string | null
          headstock_style?: string | null
          id?: string
          joint_type?: string | null
          left_handed_available?: string | null
          left_handed_rrp?: number | null
          maverick_body_family?: string | null
          middle_pickup?: string | null
          model?: string
          neck_binding?: string | null
          neck_construction?: string | null
          neck_mount?: string | null
          neck_pickup?: string | null
          neck_profile?: string | null
          neck_wood?: string | null
          notes?: string | null
          nut_type?: string | null
          nut_width?: number | null
          original_rrp?: number | null
          parent_model_id?: string | null
          pickup_colours?: string | null
          pickup_configuration?: string | null
          pickup_surrounds?: string | null
          potentiometers?: string | null
          press_references?: string | null
          production_type_id?: string | null
          rarity?: string | null
          scale_length?: string | null
          serial_prefix?: string | null
          series?: string | null
          tile_synopsis?: string | null
          side_dot_markers?: string | null
          skunk_stripe?: string | null
          specification_source?: string | null
          string_count?: number | null
          switch_knob?: string | null
          switch_type?: string | null
          tone_pot?: string | null
          tone_pot_count?: number | null
          truss_rod?: string | null
          tuner_style?: string | null
          updated_at?: string | null
          volume_pot?: string | null
          volume_pot_count?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "model_specifications_headstock_binding_fkey"
            columns: ["headstock_binding"]
            isOneToOne: false
            referencedRelation: "ref_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_specifications_maverick_body_family_fkey"
            columns: ["maverick_body_family"]
            isOneToOne: false
            referencedRelation: "ref_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_specifications_parent_model_id_fkey"
            columns: ["parent_model_id"]
            isOneToOne: false
            referencedRelation: "model_specifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_specifications_production_type_id_fkey"
            columns: ["production_type_id"]
            isOneToOne: false
            referencedRelation: "production_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_specifications_side_dot_markers_fkey"
            columns: ["side_dot_markers"]
            isOneToOne: false
            referencedRelation: "ref_values"
            referencedColumns: ["id"]
          },
        ]
      }
      pickup_configuration_map: {
        Row: {
          bridge_type: string | null
          configuration: string
          id: string
          middle_type: string | null
          neck_type: string | null
          notes: string | null
        }
        Insert: {
          bridge_type?: string | null
          configuration: string
          id?: string
          middle_type?: string | null
          neck_type?: string | null
          notes?: string | null
        }
        Update: {
          bridge_type?: string | null
          configuration?: string
          id?: string
          middle_type?: string | null
          neck_type?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      pickup_svg_map: {
        Row: {
          id: string
          notes: string | null
          pkc_style: string | null
          pkp_id: string
          pos_id: string
          svg_filename: string
          text_variant: string | null
        }
        Insert: {
          id?: string
          notes?: string | null
          pkc_style?: string | null
          pkp_id: string
          pos_id: string
          svg_filename: string
          text_variant?: string | null
        }
        Update: {
          id?: string
          notes?: string | null
          pkc_style?: string | null
          pkp_id?: string
          pos_id?: string
          svg_filename?: string
          text_variant?: string | null
        }
        Relationships: []
      }
      production_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          username: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          role?: string
          username?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          username?: string | null
        }
        Relationships: []
      }
      ref_values: {
        Row: {
          bridge_category_id: string | null
          category: string
          descriptor: string | null
          display_name: string
          id: string
          implied_neck_wood: string | null
          is_active: boolean | null
          metadata: Json | null
          sort_order: number | null
        }
        Insert: {
          bridge_category_id?: string | null
          category: string
          descriptor?: string | null
          display_name: string
          id: string
          implied_neck_wood?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          sort_order?: number | null
        }
        Update: {
          bridge_category_id?: string | null
          category?: string
          descriptor?: string | null
          display_name?: string
          id?: string
          implied_neck_wood?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ref_values_bridge_category_id_fkey"
            columns: ["bridge_category_id"]
            isOneToOne: false
            referencedRelation: "bridge_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ref_values_implied_neck_wood_fkey"
            columns: ["implied_neck_wood"]
            isOneToOne: false
            referencedRelation: "ref_values"
            referencedColumns: ["id"]
          },
        ]
      }
      serial_range_indicators: {
        Row: {
          confidence: string | null
          created_at: string | null
          generation: string
          id: string
          last_updated: string | null
          model: string
          notes: string | null
          sample_size: number | null
          serial_max: number | null
          serial_min: number | null
          series: string | null
        }
        Insert: {
          confidence?: string | null
          created_at?: string | null
          generation: string
          id?: string
          last_updated?: string | null
          model: string
          notes?: string | null
          sample_size?: number | null
          serial_max?: number | null
          serial_min?: number | null
          series?: string | null
        }
        Update: {
          confidence?: string | null
          created_at?: string | null
          generation?: string
          id?: string
          last_updated?: string | null
          model?: string
          notes?: string | null
          sample_size?: number | null
          serial_max?: number | null
          serial_min?: number | null
          series?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          contributions_open: boolean
          id: boolean
          registration_open: boolean
          submissions_open: boolean
          support_open: boolean
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          contributions_open?: boolean
          id?: boolean
          registration_open?: boolean
          submissions_open?: boolean
          support_open?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          contributions_open?: boolean
          id?: boolean
          registration_open?: boolean
          submissions_open?: boolean
          support_open?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      source_material_documents: {
        Row: {
          created_at: string | null
          file_url: string
          id: string
          label: string
          source_material_id: string
        }
        Insert: {
          created_at?: string | null
          file_url: string
          id?: string
          label: string
          source_material_id: string
        }
        Update: {
          created_at?: string | null
          file_url?: string
          id?: string
          label?: string
          source_material_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_material_documents_source_material_id_fkey"
            columns: ["source_material_id"]
            isOneToOne: false
            referencedRelation: "source_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      source_material_images: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          image_url: string
          page_number: number | null
          source_material_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          page_number?: number | null
          source_material_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          page_number?: number | null
          source_material_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_material_images_source_material_id_fkey"
            columns: ["source_material_id"]
            isOneToOne: false
            referencedRelation: "source_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      source_materials: {
        Row: {
          created_at: string | null
          description: string | null
          extracted_text: string | null
          extraction_status: string | null
          file_url: string | null
          id: string
          image_credit: string | null
          is_published: boolean
          material_type: string
          notes: string | null
          page_count: number | null
          source_credit: string | null
          thumbnail_url: string | null
          title: string
          year: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          extracted_text?: string | null
          extraction_status?: string | null
          file_url?: string | null
          id?: string
          image_credit?: string | null
          is_published?: boolean
          material_type: string
          notes?: string | null
          page_count?: number | null
          source_credit?: string | null
          thumbnail_url?: string | null
          title: string
          year?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          extracted_text?: string | null
          extraction_status?: string | null
          file_url?: string | null
          id?: string
          image_credit?: string | null
          is_published?: boolean
          material_type?: string
          notes?: string | null
          page_count?: number | null
          source_credit?: string | null
          thumbnail_url?: string | null
          title?: string
          year?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      detect_generation_conflicts: {
        Args: { p_guitar_id: string }
        Returns: string
      }
      get_email_from_username: { Args: { p_username: string }; Returns: string }
      is_super_admin: { Args: never; Returns: boolean }
      is_username_available: {
        Args: { check_username: string }
        Returns: boolean
      }
      populate_serial_range:
        | {
            Args: {
              p_max: number
              p_model: string
              p_prefix: string
              p_series: string
            }
            Returns: number
          }
        | {
            Args: {
              p_max: number
              p_model_id: string
              p_prefix: string
              p_series: string
            }
            Returns: number
          }
      refresh_serial_range_indicators: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
