import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getCurrentOrganization } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const org = await getCurrentOrganization()
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const recordType = searchParams.get('type') // 'farm' or 'food'

    let query = supabase
      .from('production_records')
      .select('*')
      .eq('organization_id', org.id)
      .order('production_date', { ascending: false })

    if (recordType) {
      query = query.eq('record_type', recordType)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching production records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch production records' },
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
      .from('production_records')
      .insert({
        organization_id: org.id,
        record_type: body.record_type,
        title: body.title,
        description: body.description,
        quantity: body.quantity,
        unit: body.unit,
        production_date: body.production_date,
        notes: body.notes,
      })
      .select()
      .single()

    if (error) throw error

    // Log activity
    await supabase.from('activity_logs').insert({
      organization_id: org.id,
      action: 'production_recorded',
      description: `Recorded ${body.record_type} production: ${body.title}`,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating production record:', error)
    return NextResponse.json(
      { error: 'Failed to create production record' },
      { status: 500 }
    )
  }
}
