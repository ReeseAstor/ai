-- Migration to add 'ai_draft' status to chapter_status enum
-- This migration should be run after the initial schema creation

-- First, we need to add the new value to the enum type
ALTER TYPE chapter_status ADD VALUE IF NOT EXISTS 'ai_draft' AFTER 'draft_complete';

-- The 'ai_draft' status will be used when an AI draft has been generated for a chapter
-- This helps track which chapters have AI-generated content available