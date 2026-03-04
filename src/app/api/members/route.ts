import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getCurrentOrganization } from '@/lib/supabase-server'

const MEMBER_TYPE_TAG = '__type:member'

export async function GET(request: NextRequest) {
  try {
    const org = await getCurrentOrganization()
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .eq('organization_id', org.id)
      .contains('skills', [MEMBER_TYPE_TAG])
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const org = await getCurrentOrganization()
    const supabase = createServerClient()
    const body = await request.json()

    const skills = [MEMBER_TYPE_TAG]
    if (body.role) skills.push(`role:${body.role}`)
    if (body.notes) skills.push(`notes:${body.notes}`)

    const { data, error } = await supabase
      .from('volunteers')
      .insert({
        organization_id: org.id,
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        skills,
        status: body.status || 'active',
        total_hours: body.family_size || 1,
      })
      .select()
      .single()

    if (error) throw error

    await supabase.from('activity_logs').insert({
      organization_id: org.id,
      action: 'member_added',
      description: `Added new member: ${body.name}`,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating member:', error)
    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    )
  }
}
