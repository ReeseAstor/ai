export type UserRole = 'admin' | 'ai_agent' | 'beta_reader';
export type ProjectStatus = 'planning' | 'writing' | 'editing' | 'review' | 'published' | 'cancelled';
export type ChapterStatus = 'not_started' | 'in_progress' | 'draft_complete' | 'ai_draft' | 'under_review' | 'approved' | 'published';
export type POVType = 'first_person' | 'third_person_limited' | 'third_person_omniscient' | 'dual_pov' | 'multi_pov';
export type HeatLevel = 'sweet' | 'mild' | 'moderate' | 'steamy' | 'explicit';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  genre: string;
  tropes: string[];
  pov: POVType;
  heat_level: HeatLevel;
  status: ProjectStatus;
  deadline: string | null;
  cost: number;
  roi: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  project_id: string;
  chapter_number: number;
  title: string | null;
  status: ChapterStatus;
  word_count: number;
  target_word_count: number;
  created_at: string;
  updated_at: string;
}

export interface AIDraft {
  id: string;
  chapter_id: string;
  content: string;
  model_used: string;
  pass_number: number;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_cost: number;
  created_at: string;
}

export interface FinalChapter {
  id: string;
  chapter_id: string;
  content: string;
  approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  project_id: string;
  reader_id: string;
  chapter_id: string | null;
  rating: number;
  comments: string | null;
  feedback_type: string;
  created_at: string;
  updated_at: string;
}