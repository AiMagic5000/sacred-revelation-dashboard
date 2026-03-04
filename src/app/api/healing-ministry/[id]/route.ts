import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getCurrentOrganization } from '@/lib/supabase-server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const org = await getCurrentOrganization()
    const supabase = createServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('healing_sessions')
      .update({
        session_type: body.session_type,
        facilitator_name: body.facilitator_name,
        attendees_count: body.attendees_count,
        session_date: body.session_date,
        location: body.location,
        notes: body.notes,
        prayer_requests: body.prayer_requests,
      })
      .eq('id', params.id)
      .eq('organization_id', org.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating healing session:', error)
    return NextResponse.json(
      { error: 'Failed to update healing session' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const org = await getCurrentOrganization()
    const supabase = createServerClient()

    const { error } = await supabase
      .from('healing_sessions')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', org.id)

    if (error) throw error

    await supabase.from('activity_logs').insert({
      organization_id: org.id,
      action: 'healing_session_deleted',
      description: `Healing session ${params.id} deleted`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting healing session:', error)
    return NextResponse.json(
      { error: 'Failed to delete healing session' },
      { status: 500 }
    )
  }
}
