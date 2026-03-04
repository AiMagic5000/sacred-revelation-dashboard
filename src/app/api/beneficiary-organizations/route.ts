import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getCurrentOrganization } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const org = await getCurrentOrganization()
    const supabase = createServerClient()

    const category = request.nextUrl.searchParams.get('category')

    let query = supabase
      .from('beneficiary_organizations')
      .select('*')
      .eq('organization_id', org.id)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching beneficiary organizations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch beneficiary organizations' },
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
      .from('beneficiary_organizations')
      .insert({
        organization_id: org.id,
        name: body.name,
        website_url: body.website_url,
        category: body.category,
        contact_email: body.contact_email,
        contact_phone: body.contact_phone,
        status: body.status || 'active',
        total_distributed: body.total_distributed || 0,
        last_distribution_date: body.last_distribution_date,
        notes: body.notes,
      })
      .select()
      .single()

    if (error) throw error

    await supabase.from('activity_logs').insert({
      organization_id: org.id,
      action: 'beneficiary_org_created',
      description: `New beneficiary organization added: ${body.name}`,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating beneficiary organization:', error)
    return NextResponse.json(
      { error: 'Failed to create beneficiary organization' },
      { status: 500 }
    )
  }
}
