import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getCurrentOrganization } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const org = await getCurrentOrganization()
    const supabase = createServerClient()

    const status = request.nextUrl.searchParams.get('status')

    let query = supabase
      .from('coaching_sessions')
      .select('*')
      .eq('organization_id', org.id)
      .order('session_date', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching coaching sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coaching sessions' },
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
      .from('coaching_sessions')
      .insert({
        organization_id: org.id,
        coach_name: body.coach_name,
        client_name: body.client_name,
        session_type: body.session_type,
        session_date: body.session_date,
        duration_minutes: body.duration_minutes,
        status: body.status || 'scheduled',
        notes: body.notes,
      })
      .select()
      .single()

    if (error) throw error

    await supabase.from('activity_logs').insert({
      organization_id: org.id,
      action: 'coaching_session_created',
      description: `New coaching session created: ${body.client_name}`,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating coaching session:', error)
    return NextResponse.json(
      { error: 'Failed to create coaching session' },
      { status: 500 }
    )
  }
}
