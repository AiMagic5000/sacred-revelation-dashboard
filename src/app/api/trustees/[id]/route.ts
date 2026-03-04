import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getCurrentOrganization } from '@/lib/supabase-server'

const TRUSTEE_TYPE_TAG = '__type:trustee'

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
      .contains('skills', [TRUSTEE_TYPE_TAG])
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching trustee:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trustee' },
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

    const skills = [TRUSTEE_TYPE_TAG]
    if (body.role) skills.push(`role:${body.role}`)
    if (body.appointment_date) skills.push(`appointed:${body.appointment_date}`)
    if (body.term_expires) skills.push(`expires:${body.term_expires}`)
    if (body.responsibilities) skills.push(`resp:${body.responsibilities}`)
    if (body.signature_on_file) skills.push('sig:yes')

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
      action: 'trustee_updated',
      description: `Updated trustee: ${body.name}`,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating trustee:', error)
    return NextResponse.json(
      { error: 'Failed to update trustee' },
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

    const { data: trustee } = await supabase
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
      action: 'trustee_removed',
      description: `Removed trustee: ${trustee?.name || 'Unknown'}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting trustee:', error)
    return NextResponse.json(
      { error: 'Failed to delete trustee' },
      { status: 500 }
    )
  }
}
