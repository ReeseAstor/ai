import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Chapter } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { project_id, chapter_number, title, target_word_count } = body;

    // Validate required fields
    if (!project_id || !chapter_number || !target_word_count) {
      return NextResponse.json(
        { error: 'Project ID, chapter number, and target word count are required' },
        { status: 400 }
      );
    }

    // Create the chapter
    const { data: chapter, error } = await supabaseAdmin
      .from('chapters')
      .insert({
        project_id,
        chapter_number,
        title: title || null,
        status: 'not_started',
        word_count: 0,
        target_word_count,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chapter:', error);
      return NextResponse.json(
        { error: 'Failed to create chapter' },
        { status: 500 }
      );
    }

    return NextResponse.json(chapter);

  } catch (error) {
    console.error('Error in chapter creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}