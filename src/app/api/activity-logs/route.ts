import { NextRequest, NextResponse } from 'next/server'
import { getCurrentOrganization, createServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const org = await getCurrentOrganization()
    const supabase = createServerClient()

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20')

    const { data: logs, error } = await supabase
      .from('activity_logs')
      .select('id, type, description, created_at, metadata')
      .eq('organization_id', org.id)
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 100))

    if (error) throw error

    return NextResponse.json({ logs })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch activity logs'
    if (message === 'Unauthorized') {
      return NextResponse.json({ logs: [] })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
