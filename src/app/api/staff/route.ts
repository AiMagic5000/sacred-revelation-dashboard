import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getCurrentOrganization } from '@/lib/supabase-server'

const STAFF_TYPE_TAG = '__type:staff'

export async function GET(request: NextRequest) {
  try {
    const org = await getCurrentOrganization()
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .eq('organization_id', org.id)
      .contains('skills', [STAFF_TYPE_TAG])
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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
      .insert({
        organization_id: org.id,
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        skills,
        status: body.status || 'active',
        total_hours: 0,
      })
      .select()
      .single()

    if (error) throw error

    await supabase.from('activity_logs').insert({
      organization_id: org.id,
      action: 'staff_added',
      description: `Added new staff member: ${body.name}`,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating staff member:', error)
    return NextResponse.json(
      { error: 'Failed to create staff member' },
      { status: 500 }
    )
  }
}
