import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getCurrentOrganization } from '@/lib/supabase-server'

export async function GET() {
  try {
    const org = await getCurrentOrganization()
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('distribution_records')
      .select('*')
      .eq('organization_id', org.id)
      .order('distribution_date', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching distribution records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch distribution records' },
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
      .from('distribution_records')
      .insert({
        organization_id: org.id,
        recipient_name: body.recipient_name,
        recipient_contact: body.recipient_contact,
        items_distributed: body.items_distributed,
        quantity: body.quantity,
        distribution_date: body.distribution_date,
        location: body.location,
        notes: body.notes,
      })
      .select()
      .single()

    if (error) throw error

    // Log activity
    await supabase.from('activity_logs').insert({
      organization_id: org.id,
      action: 'distribution_recorded',
      description: `Distributed ${body.items_distributed} to ${body.recipient_name}`,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating distribution record:', error)
    return NextResponse.json(
      { error: 'Failed to create distribution record' },
      { status: 500 }
    )
  }
}
