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

    const updateData: Record<string, unknown> = {
      title: body.title,
      description: body.description,
      due_date: body.due_date,
      status: body.status,
      priority: body.priority,
      assigned_to: body.assigned_to,
    }

    // Set completed_at when status changes to completed
    if (body.status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('compliance_items')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', org.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating compliance item:', error)
    return NextResponse.json(
      { error: 'Failed to update compliance item' },
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
      .from('compliance_items')
      .delete()
      .eq('id', id)
      .eq('organization_id', org.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting compliance item:', error)
    return NextResponse.json(
      { error: 'Failed to delete compliance item' },
      { status: 500 }
    )
  }
}
