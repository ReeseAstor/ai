import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for creating a project
const createProjectSchema = z.object({
  title: z.string().min(1).max(500),
  genre: z.string().min(1).max(100),
  tropes: z.array(z.string()),
  pov: z.enum(['first_person', 'third_person_limited', 'third_person_omniscient', 'dual_pov', 'multi_pov']),
  heat_level: z.enum(['sweet', 'mild', 'moderate', 'steamy', 'explicit']),
  status: z.enum(['planning', 'writing', 'editing', 'review', 'published', 'cancelled']).optional(),
  deadline: z.string().nullable().optional(),
  cost: z.number().min(0).optional(),
  roi: z.number().optional(),
})

// GET /api/projects - Get all projects or filtered projects
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
    const status = searchParams.get('status')
    const genre = searchParams.get('genre')
    const limit = searchParams.get('limit') || '50'
    const offset = searchParams.get('offset') || '0'

    // Build query
    let query = supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    if (status) {
      query = query.eq('status', status)
    }
    if (genre) {
      query = query.ilike('genre', `%${genre}%`)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create a new project
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
    const validatedData = createProjectSchema.parse(body)

    // Create project with user as creator
    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...validatedData,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}