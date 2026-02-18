import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/drafts/[id] - Get a single draft
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get draft with chapter info
    const { data, error } = await supabase
      .from('ai_drafts')
      .select(`
        *,
        chapter:chapters (
          id,
          chapter_number,
          title,
          status,
          project:projects (
            id,
            title,
            genre
          )
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching draft:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/drafts/[id] - Delete a draft
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get draft to verify access
    const { data: draft, error: fetchError } = await supabase
      .from('ai_drafts')
      .select(`
        id,
        chapter:chapters (
          project:projects (
            created_by
          )
        )
      `)
      .eq('id', params.id)
      .single()

    if (fetchError || !draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    // Get user role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    // Check if user is admin or project creator
    const projectCreator = (draft as any).chapter?.project?.created_by
    if (userData?.role !== 'admin' && projectCreator !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete draft
    const { error } = await supabase
      .from('ai_drafts')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Draft deleted successfully' })
  } catch (error) {
    console.error('Error deleting draft:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/drafts/[id]/finalize - Convert draft to final chapter
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the draft
    const { data: draft, error: draftError } = await supabase
      .from('ai_drafts')
      .select('*, chapter:chapters(*)')
      .eq('id', params.id)
      .single()

    if (draftError || !draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    // Check if final chapter already exists for this chapter
    const { data: existingFinal } = await supabase
      .from('final_chapters')
      .select('id')
      .eq('chapter_id', draft.chapter_id)
      .single()

    let finalChapter

    if (existingFinal) {
      // Update existing final chapter
      const { data, error } = await supabase
        .from('final_chapters')
        .update({
          content: draft.content,
          approved: false,
          approved_by: null,
          approved_at: null,
        })
        .eq('chapter_id', draft.chapter_id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      finalChapter = data
    } else {
      // Create new final chapter
      const { data, error } = await supabase
        .from('final_chapters')
        .insert({
          chapter_id: draft.chapter_id,
          content: draft.content,
          approved: false,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      finalChapter = data
    }

    // Update chapter status
    await supabase
      .from('chapters')
      .update({ status: 'draft_complete' })
      .eq('id', draft.chapter_id)

    return NextResponse.json({
      message: 'Draft finalized successfully',
      final_chapter: finalChapter,
    })
  } catch (error) {
    console.error('Error finalizing draft:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}