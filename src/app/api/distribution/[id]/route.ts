import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getCurrentOrganization } from '@/lib/supabase-server'

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
      .from('distribution_records')
      .update({
        recipient_name: body.recipient_name,
        recipient_contact: body.recipient_contact,
        items_distributed: body.items_distributed,
        quantity: body.quantity,
        distribution_date: body.distribution_date,
        location: body.location,
        notes: body.notes,
      })
      .eq('id', id)
      .eq('organization_id', org.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating distribution record:', error)
    return NextResponse.json(
      { error: 'Failed to update distribution record' },
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
      .from('distribution_records')
      .delete()
      .eq('id', id)
      .eq('organization_id', org.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting distribution record:', error)
    return NextResponse.json(
      { error: 'Failed to delete distribution record' },
      { status: 500 }
    )
  }
}
