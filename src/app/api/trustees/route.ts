import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getCurrentOrganization } from '@/lib/supabase-server'

const TRUSTEE_TYPE_TAG = '__type:trustee'

export async function GET(request: NextRequest) {
  try {
    const org = await getCurrentOrganization()
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .eq('organization_id', org.id)
      .contains('skills', [TRUSTEE_TYPE_TAG])
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching trustees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trustees' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const org = await getCurrentOrganization()
    const supabase = createServerClient()
    const body = await request.json()

    const skills = [TRUSTEE_TYPE_TAG]
    if (body.role) skills.push(`role:${body.role}`)
    if (body.appointment_date) skills.push(`appointed:${body.appointment_date}`)
    if (body.term_expires) skills.push(`expires:${body.term_expires}`)
    if (body.responsibilities) skills.push(`resp:${body.responsibilities}`)
    if (body.signature_on_file) skills.push('sig:yes')

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
      action: 'trustee_added',
      description: `Added new trustee: ${body.name} (${body.role || 'Trustee'})`,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating trustee:', error)
    return NextResponse.json(
      { error: 'Failed to create trustee' },
      { status: 500 }
    )
  }
}
