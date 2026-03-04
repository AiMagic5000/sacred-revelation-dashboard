import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getCurrentOrganization } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const org = await getCurrentOrganization()
    const supabase = createServerClient()

    const type = request.nextUrl.searchParams.get('type')

    let query = supabase
      .from('music_events')
      .select('*')
      .eq('organization_id', org.id)
      .order('event_date', { ascending: false })

    if (type) {
      query = query.eq('event_type', type)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching music events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch music events' },
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
      .from('music_events')
      .insert({
        organization_id: org.id,
        event_name: body.event_name,
        event_type: body.event_type,
        musicians: body.musicians,
        songs_performed: body.songs_performed,
        event_date: body.event_date,
        duration_minutes: body.duration_minutes,
        location: body.location,
        notes: body.notes,
      })
      .select()
      .single()

    if (error) throw error

    await supabase.from('activity_logs').insert({
      organization_id: org.id,
      action: 'music_event_created',
      description: `New music event created: ${body.event_name}`,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating music event:', error)
    return NextResponse.json(
      { error: 'Failed to create music event' },
      { status: 500 }
    )
  }
}
