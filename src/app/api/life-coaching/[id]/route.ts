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
      .from('coaching_sessions')
      .update({
        coach_name: body.coach_name,
        client_name: body.client_name,
        session_type: body.session_type,
        session_date: body.session_date,
        duration_minutes: body.duration_minutes,
        status: body.status,
        notes: body.notes,
      })
      .eq('id', params.id)
      .eq('organization_id', org.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating coaching session:', error)
    return NextResponse.json(
      { error: 'Failed to update coaching session' },
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
      .from('coaching_sessions')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', org.id)

    if (error) throw error

    await supabase.from('activity_logs').insert({
      organization_id: org.id,
      action: 'coaching_session_deleted',
      description: `Coaching session ${params.id} deleted`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting coaching session:', error)
    return NextResponse.json(
      { error: 'Failed to delete coaching session' },
      { status: 500 }
    )
  }
}
