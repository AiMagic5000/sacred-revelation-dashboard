import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getCurrentOrganization } from '@/lib/supabase-server'

const STAFF_TYPE_TAG = '__type:staff'

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
      .contains('skills', [STAFF_TYPE_TAG])
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching staff member:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff member' },
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

    const skills = [STAFF_TYPE_TAG]
    if (body.title) skills.push(`title:${body.title}`)
    if (body.department) skills.push(`dept:${body.department}`)
    if (body.hire_date) skills.push(`hired:${body.hire_date}`)
    if (body.salary_range) skills.push(`salary:${body.salary_range}`)

    const { data, error } = await supabase
      .from('volunteers')
      .update({
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        skills,
        status: body.status,
        total_hours: 0,
      })
      .eq('id', id)
      .eq('organization_id', org.id)
      .select()
      .single()

    if (error) throw error

    await supabase.from('activity_logs').insert({
      organization_id: org.id,
      action: 'staff_updated',
      description: `Updated staff member: ${body.name}`,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating staff member:', error)
    return NextResponse.json(
      { error: 'Failed to update staff member' },
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

    const { data: staff } = await supabase
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
      action: 'staff_removed',
      description: `Removed staff member: ${staff?.name || 'Unknown'}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting staff member:', error)
    return NextResponse.json(
      { error: 'Failed to delete staff member' },
      { status: 500 }
    )
  }
}
