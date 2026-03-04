import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getCurrentOrganization } from '@/lib/supabase-server'

const TAX_DOCUMENT_CATEGORIES = [
  'Trust Indenture',
  'IRS Determination Letter',
  'Annual Financial Statement',
  'Meeting Minutes',
  'Elder Board Resolutions',
  'Donor Acknowledgment Letters',
  'State Filing Receipts',
  'Form 990-N Confirmation',
] as const

export async function GET(request: NextRequest) {
  try {
    const org = await getCurrentOrganization()
    const supabase = createServerClient()

    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
      ? Number(searchParams.get('year'))
      : new Date().getFullYear()

    // Fetch all tax-related documents for this organization
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .eq('organization_id', org.id)
      .in('category', [
        'Tax Documents',
        'Trust Indenture',
        'IRS Determination Letter',
        'Annual Financial Statement',
        'Meeting Minutes',
        'Elder Board Resolutions',
        'Donor Acknowledgment Letters',
        'State Filing Receipts',
        'Form 990-N Confirmation',
        'Legal Documents',
      ])
      .order('created_at', { ascending: false })

    if (docsError) throw docsError

    // Fetch donations for donor acknowledgment letter generation
    const { data: donations, error: donError } = await supabase
      .from('donations')
      .select('*')
      .eq('organization_id', org.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    if (donError) throw donError

    // Fetch trust data for org name in letters
    const { data: trustData } = await supabase
      .from('trust_data')
      .select('*')
      .eq('organization_id', org.id)
      .single()

    const allDocs = documents || []
    const allDonations = donations || []

    // Filter by year
    const yearDocs = allDocs.filter(
      (d) => new Date(d.created_at).getFullYear() === year
    )

    // Build checklist status for each required document category
    const checklist = TAX_DOCUMENT_CATEGORIES.map((category) => {
      const docs = yearDocs.filter((d) => d.category === category)
      const allTimeDocs = allDocs.filter((d) => d.category === category)

      let status: 'complete' | 'partial' | 'missing' = 'missing'
      if (docs.length > 0) {
        status = 'complete'
      } else if (allTimeDocs.length > 0) {
        // Has document from other years but not current year
        status = 'partial'
      }

      return {
        category,
        status,
        documentCount: docs.length,
        allTimeCount: allTimeDocs.length,
        latestUpload: docs[0]?.created_at || allTimeDocs[0]?.created_at || null,
        documents: docs,
      }
    })

    // Donor acknowledgment data -- group by donor for selected year
    const yearDonations = allDonations.filter(
      (d) => new Date(d.created_at).getFullYear() === year
    )

    const donorMap = new Map<
      string,
      {
        total: number
        count: number
        email?: string
        receipts: string[]
        donations: Array<{
          amount: number
          date: string
          receipt_number?: string
          payment_method?: string
        }>
      }
    >()

    for (const d of yearDonations) {
      const name = d.donor_name || 'Anonymous'
      const existing = donorMap.get(name) || {
        total: 0,
        count: 0,
        receipts: [],
        donations: [],
      }
      donorMap.set(name, {
        total: existing.total + (d.amount || 0),
        count: existing.count + 1,
        email: d.donor_email || existing.email,
        receipts: d.receipt_number
          ? [...existing.receipts, d.receipt_number]
          : existing.receipts,
        donations: [
          ...existing.donations,
          {
            amount: d.amount || 0,
            date: d.created_at,
            receipt_number: d.receipt_number,
            payment_method: d.payment_method,
          },
        ],
      })
    }

    const donorAcknowledgments = Array.from(donorMap.entries())
      .map(([name, values]) => ({ name, ...values }))
      .sort((a, b) => b.total - a.total)

    // Available years
    const yearSet = new Set<number>()
    yearSet.add(new Date().getFullYear())
    for (const d of allDocs) {
      yearSet.add(new Date(d.created_at).getFullYear())
    }
    for (const d of allDonations) {
      yearSet.add(new Date(d.created_at).getFullYear())
    }

    // Compliance summary
    const completeCount = checklist.filter((c) => c.status === 'complete').length
    const partialCount = checklist.filter((c) => c.status === 'partial').length
    const missingCount = checklist.filter((c) => c.status === 'missing').length

    return NextResponse.json({
      year,
      availableYears: Array.from(yearSet).sort((a, b) => b - a),
      checklist,
      compliance: {
        completeCount,
        partialCount,
        missingCount,
        total: checklist.length,
        percentage: Math.round((completeCount / checklist.length) * 100),
      },
      donorAcknowledgments,
      trustData: trustData || null,
      allDocuments: yearDocs,
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to fetch tax documents data'
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
