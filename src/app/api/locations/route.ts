import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getCurrentOrganization } from '@/lib/supabase-server'

export async function GET() {
  try {
    const org = await getCurrentOrganization()
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('organization_id', org.id)
      .order('is_primary', { ascending: false })
      .order('name', { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
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
      .from('locations')
      .insert({
        organization_id: org.id,
        name: body.name,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        zip: body.zip || null,
        location_type: body.location_type || 'Main Sanctuary',
        capacity: body.capacity || null,
        description: body.description || null,
        is_primary: body.is_primary || false,
        contact_phone: body.contact_phone || null,
      })
      .select()
      .single()

    if (error) throw error

    await supabase.from('activity_logs').insert({
      organization_id: org.id,
      action: 'location_created',
      description: `Added new location: ${body.name}`,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating location:', error)
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    )
  }
}
