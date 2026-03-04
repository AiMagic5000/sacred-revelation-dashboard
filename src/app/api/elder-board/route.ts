import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getCurrentOrganization } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const org = await getCurrentOrganization()
    const supabase = createServerClient()

    const status = request.nextUrl.searchParams.get('status')

    let query = supabase
      .from('elder_board_resolutions')
      .select('*')
      .eq('organization_id', org.id)
      .order('resolution_date', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching elder board resolutions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch elder board resolutions' },
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
      .from('elder_board_resolutions')
      .insert({
        organization_id: org.id,
        resolution_number: body.resolution_number,
        title: body.title,
        description: body.description,
        proposed_by: body.proposed_by,
        seconded_by: body.seconded_by,
        vote_result: body.vote_result,
        resolution_date: body.resolution_date,
        status: body.status || 'proposed',
      })
      .select()
      .single()

    if (error) throw error

    await supabase.from('activity_logs').insert({
      organization_id: org.id,
      action: 'elder_resolution_created',
      description: `New resolution proposed: ${body.title}`,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating elder board resolution:', error)
    return NextResponse.json(
      { error: 'Failed to create elder board resolution' },
      { status: 500 }
    )
  }
}
