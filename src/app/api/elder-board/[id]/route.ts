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
      .from('elder_board_resolutions')
      .update({
        resolution_number: body.resolution_number,
        title: body.title,
        description: body.description,
        proposed_by: body.proposed_by,
        seconded_by: body.seconded_by,
        vote_result: body.vote_result,
        resolution_date: body.resolution_date,
        status: body.status,
      })
      .eq('id', params.id)
      .eq('organization_id', org.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating elder board resolution:', error)
    return NextResponse.json(
      { error: 'Failed to update elder board resolution' },
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
      .from('elder_board_resolutions')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', org.id)

    if (error) throw error

    await supabase.from('activity_logs').insert({
      organization_id: org.id,
      action: 'elder_resolution_deleted',
      description: `Resolution ${params.id} deleted`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting elder board resolution:', error)
    return NextResponse.json(
      { error: 'Failed to delete elder board resolution' },
      { status: 500 }
    )
  }
}
