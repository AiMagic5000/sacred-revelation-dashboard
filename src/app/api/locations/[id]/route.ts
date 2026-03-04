import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getCurrentOrganization } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const org = await getCurrentOrganization()
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .eq('organization_id', org.id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching location:', error)
    return NextResponse.json(
      { error: 'Failed to fetch location' },
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

    const { data, error } = await supabase
      .from('locations')
      .update({
        name: body.name,
        address: body.address,
        city: body.city,
        state: body.state,
        zip: body.zip,
        location_type: body.location_type,
        capacity: body.capacity,
        description: body.description,
        is_primary: body.is_primary,
        contact_phone: body.contact_phone,
      })
      .eq('id', id)
      .eq('organization_id', org.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating location:', error)
    return NextResponse.json(
      { error: 'Failed to update location' },
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

    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id)
      .eq('organization_id', org.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting location:', error)
    return NextResponse.json(
      { error: 'Failed to delete location' },
      { status: 500 }
    )
  }
}
