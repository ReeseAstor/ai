import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for creating a draft
const createDraftSchema = z.object({
  chapter_id: z.string().uuid(),
  content: z.string().min(1),
  model_used: z.string().min(1).max(100),
  pass_number: z.number().int().positive().optional(),
  prompt_tokens: z.number().int().min(0).nullable().optional(),
  completion_tokens: z.number().int().min(0).nullable().optional(),
  total_cost: z.number().min(0).optional(),
})

// GET /api/drafts - Get drafts (filtered by chapter_id)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const chapterId = searchParams.get('chapter_id')
    const projectId = searchParams.get('project_id')
    const limit = searchParams.get('limit') || '10'

    // Build query
    let query = supabase
      .from('ai_drafts')
      .select(`
        *,
        chapter:chapters (
          id,
          chapter_number,
          title,
          project_id
        )
      `)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit))

    if (chapterId) {
      query = query.eq('chapter_id', chapterId)
    }

    // If filtering by project, we need to join through chapters
    if (projectId && !chapterId) {
      query = query.eq('chapter.project_id', projectId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching drafts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/drafts - Create a new draft
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createDraftSchema.parse(body)

    // Verify chapter exists
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('id, project_id')
      .eq('id', validatedData.chapter_id)
      .single()

    if (chapterError || !chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    // If pass_number not provided, calculate it
    if (!validatedData.pass_number) {
      const { data: lastDraft } = await supabase
        .from('ai_drafts')
        .select('pass_number')
        .eq('chapter_id', validatedData.chapter_id)
        .order('pass_number', { ascending: false })
        .limit(1)
        .single()

      validatedData.pass_number = lastDraft ? lastDraft.pass_number + 1 : 1
    }

    // Create draft
    const { data, error } = await supabase
      .from('ai_drafts')
      .insert(validatedData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Update chapter status to in_progress if it was not_started
    await supabase
      .from('chapters')
      .update({ status: 'in_progress' })
      .eq('id', validatedData.chapter_id)
      .eq('status', 'not_started')

    // Calculate word count and update chapter
    const wordCount = validatedData.content.split(/\s+/).filter(word => word.length > 0).length
    await supabase
      .from('chapters')
      .update({ word_count: wordCount })
      .eq('id', validatedData.chapter_id)

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating draft:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}