export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'admin' | 'ai_agent' | 'beta_reader'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: 'admin' | 'ai_agent' | 'beta_reader'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'admin' | 'ai_agent' | 'beta_reader'
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          genre: string
          tropes: string[]
          pov: 'first_person' | 'third_person_limited' | 'third_person_omniscient' | 'dual_pov' | 'multi_pov'
          heat_level: 'sweet' | 'mild' | 'moderate' | 'steamy' | 'explicit'
          status: 'planning' | 'writing' | 'editing' | 'review' | 'published' | 'cancelled'
          deadline: string | null
          cost: number
          roi: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          genre: string
          tropes: string[]
          pov: 'first_person' | 'third_person_limited' | 'third_person_omniscient' | 'dual_pov' | 'multi_pov'
          heat_level: 'sweet' | 'mild' | 'moderate' | 'steamy' | 'explicit'
          status?: 'planning' | 'writing' | 'editing' | 'review' | 'published' | 'cancelled'
          deadline?: string | null
          cost?: number
          roi?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          genre?: string
          tropes?: string[]
          pov?: 'first_person' | 'third_person_limited' | 'third_person_omniscient' | 'dual_pov' | 'multi_pov'
          heat_level?: 'sweet' | 'mild' | 'moderate' | 'steamy' | 'explicit'
          status?: 'planning' | 'writing' | 'editing' | 'review' | 'published' | 'cancelled'
          deadline?: string | null
          cost?: number
          roi?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chapters: {
        Row: {
          id: string
          project_id: string
          chapter_number: number
          title: string | null
          status: 'not_started' | 'in_progress' | 'draft_complete' | 'under_review' | 'approved' | 'published'
          word_count: number
          target_word_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          chapter_number: number
          title?: string | null
          status?: 'not_started' | 'in_progress' | 'draft_complete' | 'under_review' | 'approved' | 'published'
          word_count?: number
          target_word_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          chapter_number?: number
          title?: string | null
          status?: 'not_started' | 'in_progress' | 'draft_complete' | 'under_review' | 'approved' | 'published'
          word_count?: number
          target_word_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      ai_drafts: {
        Row: {
          id: string
          chapter_id: string
          content: string
          model_used: string
          pass_number: number
          prompt_tokens: number | null
          completion_tokens: number | null
          total_cost: number
          created_at: string
        }
        Insert: {
          id?: string
          chapter_id: string
          content: string
          model_used: string
          pass_number?: number
          prompt_tokens?: number | null
          completion_tokens?: number | null
          total_cost?: number
          created_at?: string
        }
        Update: {
          id?: string
          chapter_id?: string
          content?: string
          model_used?: string
          pass_number?: number
          prompt_tokens?: number | null
          completion_tokens?: number | null
          total_cost?: number
          created_at?: string
        }
      }
      final_chapters: {
        Row: {
          id: string
          chapter_id: string
          content: string
          approved: boolean
          approved_by: string | null
          approved_at: string | null
          word_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chapter_id: string
          content: string
          approved?: boolean
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chapter_id?: string
          content?: string
          approved?: boolean
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          project_id: string
          reader_id: string
          chapter_id: string | null
          rating: number
          comments: string | null
          feedback_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          reader_id: string
          chapter_id?: string | null
          rating: number
          comments?: string | null
          feedback_type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          reader_id?: string
          chapter_id?: string | null
          rating?: number
          comments?: string | null
          feedback_type?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      project_overview: {
        Row: {
          id: string
          title: string
          genre: string
          status: string
          total_chapters: number
          approved_chapters: number
          average_rating: number | null
          total_feedback: number
        }
      }
      chapter_progress: {
        Row: {
          id: string
          project_id: string
          chapter_number: number
          title: string | null
          status: string
          project_title: string
          total_drafts: number
          latest_pass: number | null
          is_approved: boolean | null
          final_content: string | null
        }
      }
    }
  }
}