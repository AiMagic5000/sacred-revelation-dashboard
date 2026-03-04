import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getCurrentOrganization } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const org = await getCurrentOrganization()
    const supabase = createServerClient()

    const type = request.nextUrl.searchParams.get('type')

    let query = supabase
      .from('healing_sessions')
      .select('*')
      .eq('organization_id', org.id)
      .order('session_date', { ascending: false })

    if (type) {
      query = query.eq('session_type', type)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching healing sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch healing sessions' },
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
      .from('healing_sessions')
      .insert({
        organization_id: org.id,
        session_type: body.session_type,
        facilitator_name: body.facilitator_name,
        attendees_count: body.attendees_count,
        session_date: body.session_date,
        location: body.location,
        notes: body.notes,
        prayer_requests: body.prayer_requests,
      })
      .select()
      .single()

    if (error) throw error

    await supabase.from('activity_logs').insert({
      organization_id: org.id,
      action: 'healing_session_created',
      description: `New healing session created: ${body.session_type}`,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating healing session:', error)
    return NextResponse.json(
      { error: 'Failed to create healing session' },
      { status: 500 }
    )
  }
}
