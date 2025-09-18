-- Supabase SQL Schema for AI-Powered Romance Book Factory
-- Created: September 18, 2025

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for better data integrity
CREATE TYPE user_role AS ENUM ('admin', 'ai_agent', 'beta_reader');
CREATE TYPE project_status AS ENUM ('planning', 'writing', 'editing', 'review', 'published', 'cancelled');
CREATE TYPE chapter_status AS ENUM ('not_started', 'in_progress', 'draft_complete', 'under_review', 'approved', 'published');
CREATE TYPE pov_type AS ENUM ('first_person', 'third_person_limited', 'third_person_omniscient', 'dual_pov', 'multi_pov');
CREATE TYPE heat_level AS ENUM ('sweet', 'mild', 'moderate', 'steamy', 'explicit');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Add check constraint for email format
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    tropes TEXT[], -- Array of tropes for flexible storage
    pov pov_type NOT NULL,
    heat_level heat_level NOT NULL,
    status project_status NOT NULL DEFAULT 'planning',
    deadline DATE,
    cost DECIMAL(10, 2) DEFAULT 0.00,
    roi DECIMAL(10, 2) DEFAULT 0.00,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Add check constraints
    CONSTRAINT positive_cost CHECK (cost >= 0),
    CONSTRAINT valid_deadline CHECK (deadline IS NULL OR deadline > CURRENT_DATE)
);

-- Chapters table
CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(500),
    status chapter_status NOT NULL DEFAULT 'not_started',
    word_count INTEGER DEFAULT 0,
    target_word_count INTEGER DEFAULT 3000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique chapter numbers per project
    CONSTRAINT unique_chapter_per_project UNIQUE (project_id, chapter_number),
    -- Ensure positive chapter numbers
    CONSTRAINT positive_chapter_number CHECK (chapter_number > 0),
    -- Ensure non-negative word counts
    CONSTRAINT non_negative_word_count CHECK (word_count >= 0),
    CONSTRAINT positive_target_word_count CHECK (target_word_count > 0)
);

-- AI Drafts table
CREATE TABLE ai_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    model_used VARCHAR(100) NOT NULL,
    pass_number INTEGER NOT NULL DEFAULT 1,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_cost DECIMAL(10, 4) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure positive pass numbers
    CONSTRAINT positive_pass_number CHECK (pass_number > 0),
    -- Ensure non-negative token counts
    CONSTRAINT non_negative_tokens CHECK (
        (prompt_tokens IS NULL OR prompt_tokens >= 0) AND 
        (completion_tokens IS NULL OR completion_tokens >= 0)
    ),
    -- Ensure non-negative cost
    CONSTRAINT non_negative_cost CHECK (total_cost >= 0)
);

-- Final Chapters table
CREATE TABLE final_chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    approved BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    word_count INTEGER GENERATED ALWAYS AS (array_length(string_to_array(content, ' '), 1)) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure only one final chapter per chapter (latest version)
    -- This is handled by a trigger below to archive old versions
    CONSTRAINT unique_final_chapter UNIQUE (chapter_id)
);

-- Feedback table
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    reader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE, -- Optional: feedback can be for specific chapter
    rating INTEGER NOT NULL,
    comments TEXT,
    feedback_type VARCHAR(50) DEFAULT 'general', -- 'general', 'plot', 'character', 'pacing', etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure rating is between 1 and 5
    CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5),
    -- Ensure only beta readers can provide feedback
    CONSTRAINT reader_must_be_beta_reader CHECK (
        reader_id IN (SELECT id FROM users WHERE role = 'beta_reader')
    )
);

-- Create indexes for better query performance
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_deadline ON projects(deadline);
CREATE INDEX idx_chapters_project_id ON chapters(project_id);
CREATE INDEX idx_chapters_status ON chapters(status);
CREATE INDEX idx_ai_drafts_chapter_id ON ai_drafts(chapter_id);
CREATE INDEX idx_ai_drafts_created_at ON ai_drafts(created_at DESC);
CREATE INDEX idx_final_chapters_chapter_id ON final_chapters(chapter_id);
CREATE INDEX idx_final_chapters_approved ON final_chapters(approved);
CREATE INDEX idx_feedback_project_id ON feedback(project_id);
CREATE INDEX idx_feedback_reader_id ON feedback(reader_id);
CREATE INDEX idx_feedback_rating ON feedback(rating);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_final_chapters_updated_at BEFORE UPDATE ON final_chapters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to update chapter status based on final chapter approval
CREATE OR REPLACE FUNCTION update_chapter_status_on_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.approved = TRUE AND OLD.approved = FALSE THEN
        UPDATE chapters 
        SET status = 'approved'
        WHERE id = NEW.chapter_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chapter_status_trigger
    AFTER UPDATE OF approved ON final_chapters
    FOR EACH ROW
    EXECUTE FUNCTION update_chapter_status_on_approval();

-- Create a function to calculate project ROI
CREATE OR REPLACE FUNCTION calculate_project_roi()
RETURNS TRIGGER AS $$
BEGIN
    -- This is a placeholder - you would implement your actual ROI calculation logic here
    -- For example: NEW.roi = ((revenue - NEW.cost) / NEW.cost) * 100
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_roi_trigger
    BEFORE INSERT OR UPDATE OF cost ON projects
    FOR EACH ROW
    EXECUTE FUNCTION calculate_project_roi();

-- Create views for common queries

-- View for project overview with chapter count
CREATE VIEW project_overview AS
SELECT 
    p.*,
    COUNT(DISTINCT c.id) as total_chapters,
    COUNT(DISTINCT CASE WHEN c.status = 'approved' THEN c.id END) as approved_chapters,
    AVG(f.rating) as average_rating,
    COUNT(DISTINCT f.id) as total_feedback
FROM projects p
LEFT JOIN chapters c ON p.id = c.project_id
LEFT JOIN feedback f ON p.id = f.project_id
GROUP BY p.id;

-- View for chapter progress
CREATE VIEW chapter_progress AS
SELECT 
    c.*,
    p.title as project_title,
    COUNT(DISTINCT ad.id) as total_drafts,
    MAX(ad.pass_number) as latest_pass,
    fc.approved as is_approved,
    fc.content as final_content
FROM chapters c
JOIN projects p ON c.project_id = p.id
LEFT JOIN ai_drafts ad ON c.id = ad.chapter_id
LEFT JOIN final_chapters fc ON c.id = fc.chapter_id
GROUP BY c.id, p.title, fc.approved, fc.content;

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (you'll need to adjust based on your auth system)
-- Example: Admins can see everything
CREATE POLICY admin_all_access ON users
    FOR ALL
    USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY admin_projects_access ON projects
    FOR ALL
    USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Beta readers can only see projects they're assigned to (you might need an assignment table)
CREATE POLICY beta_reader_feedback_access ON feedback
    FOR ALL
    USING (reader_id = auth.uid() OR auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Add comments for documentation
COMMENT ON TABLE users IS 'Stores all system users including admins, AI agents, and beta readers';
COMMENT ON TABLE projects IS 'Romance book projects with metadata about genre, tropes, and business metrics';
COMMENT ON TABLE chapters IS 'Individual chapters within each project';
COMMENT ON TABLE ai_drafts IS 'AI-generated draft versions of chapters with model and cost tracking';
COMMENT ON TABLE final_chapters IS 'Approved final versions of chapters ready for publication';
COMMENT ON TABLE feedback IS 'Beta reader feedback and ratings for projects and chapters';

COMMENT ON COLUMN projects.tropes IS 'Array of romance tropes like enemies-to-lovers, fake-dating, etc.';
COMMENT ON COLUMN projects.roi IS 'Return on Investment calculated based on cost and revenue';
COMMENT ON COLUMN ai_drafts.pass_number IS 'Iteration number for AI drafts (1 for first draft, 2 for revision, etc.)';