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
      .from('music_events')
      .update({
        event_name: body.event_name,
        event_type: body.event_type,
        musicians: body.musicians,
        songs_performed: body.songs_performed,
        event_date: body.event_date,
        duration_minutes: body.duration_minutes,
        location: body.location,
        notes: body.notes,
      })
      .eq('id', params.id)
      .eq('organization_id', org.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating music event:', error)
    return NextResponse.json(
      { error: 'Failed to update music event' },
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
      .from('music_events')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', org.id)

    if (error) throw error

    await supabase.from('activity_logs').insert({
      organization_id: org.id,
      action: 'music_event_deleted',
      description: `Music event ${params.id} deleted`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting music event:', error)
    return NextResponse.json(
      { error: 'Failed to delete music event' },
      { status: 500 }
    )
  }
}
