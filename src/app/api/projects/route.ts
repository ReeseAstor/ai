import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';

const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  genre: z.string().min(1, 'Genre is required'),
  tropes: z.array(z.string()).optional().default([]),
  pov: z.enum(['first_person', 'third_person_limited', 'third_person_omniscient', 'dual_pov', 'multi_pov']),
  heat_level: z.enum(['sweet', 'mild', 'moderate', 'steamy', 'explicit']),
  status: z.enum(['planning', 'writing', 'editing', 'review', 'published', 'cancelled']).optional().default('planning'),
  deadline: z.string().optional().nullable(),
  created_by: z.string().uuid().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = createProjectSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, genre, tropes, pov, heat_level, status, deadline, created_by } = parsed.data;

    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .insert({
        title,
        genre,
        tropes: tropes || [],
        pov,
        heat_level,
        status,
        deadline: deadline || null,
        created_by: created_by || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (err) {
    console.error('Error creating project:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

