import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getCurrentOrganization } from '@/lib/supabase-server'

export async function GET() {
  try {
    const org = await getCurrentOrganization()
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('compliance_items')
      .select('*')
      .eq('organization_id', org.id)
      .order('due_date', { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching compliance items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch compliance items' },
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
      .from('compliance_items')
      .insert({
        organization_id: org.id,
        title: body.title,
        description: body.description,
        due_date: body.due_date,
        status: body.status || 'pending',
        priority: body.priority || 'medium',
        assigned_to: body.assigned_to,
      })
      .select()
      .single()

    if (error) throw error

    // Log activity
    await supabase.from('activity_logs').insert({
      organization_id: org.id,
      action: 'compliance_item_created',
      description: `Added compliance task: ${body.title}`,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating compliance item:', error)
    return NextResponse.json(
      { error: 'Failed to create compliance item' },
      { status: 500 }
    )
  }
}
