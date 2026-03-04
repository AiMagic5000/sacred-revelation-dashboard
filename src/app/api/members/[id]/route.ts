import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getCurrentOrganization } from '@/lib/supabase-server'

const MEMBER_TYPE_TAG = '__type:member'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const org = await getCurrentOrganization()
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .eq('id', id)
      .eq('organization_id', org.id)
      .contains('skills', [MEMBER_TYPE_TAG])
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching member:', error)
    return NextResponse.json(
      { error: 'Failed to fetch member' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const org = await getCurrentOrganization()
    const supabase = createServerClient()
    const body = await request.json()

    const skills = [MEMBER_TYPE_TAG]
    if (body.role) skills.push(`role:${body.role}`)
    if (body.notes) skills.push(`notes:${body.notes}`)

    const { data, error } = await supabase
      .from('volunteers')
      .update({
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        skills,
        status: body.status,
        total_hours: body.family_size || 1,
      })
      .eq('id', id)
      .eq('organization_id', org.id)
      .select()
      .single()

    if (error) throw error

    await supabase.from('activity_logs').insert({
      organization_id: org.id,
      action: 'member_updated',
      description: `Updated member: ${body.name}`,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating member:', error)
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const org = await getCurrentOrganization()
    const supabase = createServerClient()

    // Get name before deleting for activity log
    const { data: member } = await supabase
      .from('volunteers')
      .select('name')
      .eq('id', id)
      .eq('organization_id', org.id)
      .single()

    const { error } = await supabase
      .from('volunteers')
      .delete()
      .eq('id', id)
      .eq('organization_id', org.id)

    if (error) throw error

    await supabase.from('activity_logs').insert({
      organization_id: org.id,
      action: 'member_removed',
      description: `Removed member: ${member?.name || 'Unknown'}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting member:', error)
    return NextResponse.json(
      { error: 'Failed to delete member' },
      { status: 500 }
    )
  }
}
