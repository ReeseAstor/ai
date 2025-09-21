import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';

const createChapterSchema = z.object({
  project_id: z.string().uuid(),
  chapter_number: z.number().int().positive(),
  title: z.string().min(1).optional().nullable(),
  target_word_count: z.number().int().positive().optional().default(3000),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = createChapterSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { project_id, chapter_number, title, target_word_count } = parsed.data;

    // Ensure project exists
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { data: chapter, error } = await supabaseAdmin
      .from('chapters')
      .insert({
        project_id,
        chapter_number,
        title: title || null,
        target_word_count: target_word_count || 3000,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, chapter }, { status: 201 });
  } catch (err) {
    console.error('Error creating chapter:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

