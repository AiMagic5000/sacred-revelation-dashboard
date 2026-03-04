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
      .from('beneficiary_organizations')
      .update({
        name: body.name,
        website_url: body.website_url,
        category: body.category,
        contact_email: body.contact_email,
        contact_phone: body.contact_phone,
        status: body.status,
        total_distributed: body.total_distributed,
        last_distribution_date: body.last_distribution_date,
        notes: body.notes,
      })
      .eq('id', params.id)
      .eq('organization_id', org.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating beneficiary organization:', error)
    return NextResponse.json(
      { error: 'Failed to update beneficiary organization' },
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
      .from('beneficiary_organizations')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', org.id)

    if (error) throw error

    await supabase.from('activity_logs').insert({
      organization_id: org.id,
      action: 'beneficiary_org_deleted',
      description: `Beneficiary organization ${params.id} deleted`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting beneficiary organization:', error)
    return NextResponse.json(
      { error: 'Failed to delete beneficiary organization' },
      { status: 500 }
    )
  }
}
