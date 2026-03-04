import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getCurrentOrganization } from '@/lib/supabase-server'

export async function GET() {
  try {
    const org = await getCurrentOrganization()
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('organization_id', org.id)
      .order('start_date', { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const org = await getCurrentOrganization()
    const supabase = createServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('events')
      .insert({
        organization_id: org.id,
        title: body.title,
        description: body.description,
        start_date: body.start_date,
        end_date: body.end_date,
        location: body.location,
        event_type: body.event_type,
        recurring: body.recurring || false,
      })
      .select()
      .single()

    if (error) throw error

    // Log activity
    await supabase.from('activity_logs').insert({
      organization_id: org.id,
      action: 'event_created',
      description: `Scheduled new event: ${body.title}`,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
