import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      genre,
      tropes = [],
      pov,
      heat_level,
      deadline = null,
      created_by = null,
    } = body || {};

    if (!title || !genre || !pov || !heat_level) {
      return NextResponse.json(
        { error: 'title, genre, pov, and heat_level are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert({
        title,
        genre,
        tropes,
        pov,
        heat_level,
        deadline,
        created_by,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    return NextResponse.json({ success: true, project: data });
  } catch (error) {
    console.error('Error in projects POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

