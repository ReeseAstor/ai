import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Project } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, genre, tropes, pov, heat_level, deadline } = body;

    // Validate required fields
    if (!title || !genre || !pov || !heat_level) {
      return NextResponse.json(
        { error: 'Title, genre, POV, and heat level are required' },
        { status: 400 }
      );
    }

    // Create the project
    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .insert({
        title,
        genre,
        tropes: tropes || [],
        pov,
        heat_level,
        status: 'planning',
        deadline: deadline || null,
        cost: 0,
        roi: 0,
        created_by: null, // TODO: Add user authentication
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      );
    }

    return NextResponse.json(project);

  } catch (error) {
    console.error('Error in project creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}