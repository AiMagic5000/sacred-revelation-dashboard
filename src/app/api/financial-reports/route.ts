import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getCurrentOrganization } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const org = await getCurrentOrganization()
    const supabase = createServerClient()

    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
      ? Number(searchParams.get('year'))
      : new Date().getFullYear()

    // Fetch all donations for the organization
    const { data: donations, error: donationsError } = await supabase
      .from('donations')
      .select('*')
      .eq('organization_id', org.id)
      .order('created_at', { ascending: false })

    if (donationsError) throw donationsError

    // Fetch expense documents (category = 'Financial Receipts')
    const { data: expenseDocs, error: expenseError } = await supabase
      .from('documents')
      .select('*')
      .eq('organization_id', org.id)
      .eq('category', 'Financial Receipts')
      .order('created_at', { ascending: false })

    if (expenseError) throw expenseError

    const allDonations = donations || []
    const allExpenses = expenseDocs || []

    // Filter by year
    const yearDonations = allDonations.filter(
      (d) => new Date(d.created_at).getFullYear() === year
    )
    const yearExpenses = allExpenses.filter(
      (e) => new Date(e.created_at).getFullYear() === year
    )

    // Compute totals
    const completedDonations = yearDonations.filter(
      (d) => d.status === 'completed'
    )
    const pendingDonations = yearDonations.filter(
      (d) => d.status === 'pending'
    )

    const totalIncome = completedDonations.reduce(
      (sum, d) => sum + (d.amount || 0),
      0
    )
    const pendingIncome = pendingDonations.reduce(
      (sum, d) => sum + (d.amount || 0),
      0
    )

    // Parse expense amounts from document name metadata
    // Documents stored with name format: "expense_amount:123.45|vendor:Name|description:text|category:type"
    // Or simple name with metadata in notes-like fields -- we use a metadata JSON approach
    const totalExpenses = yearExpenses.reduce((sum, e) => {
      // Try to parse amount from the document name metadata pattern
      const amountMatch = e.name?.match(/\$(\d+(?:\.\d{2})?)/)
      return sum + (amountMatch ? parseFloat(amountMatch[1]) : 0)
    }, 0)

    // Monthly breakdown
    const monthlyMap = new Map<
      string,
      { income: number; expenses: number; donationCount: number }
    >()

    for (const d of completedDonations) {
      const date = new Date(d.created_at)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const existing = monthlyMap.get(key) || {
        income: 0,
        expenses: 0,
        donationCount: 0,
      }
      monthlyMap.set(key, {
        ...existing,
        income: existing.income + (d.amount || 0),
        donationCount: existing.donationCount + 1,
      })
    }

    for (const e of yearExpenses) {
      const date = new Date(e.created_at)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const existing = monthlyMap.get(key) || {
        income: 0,
        expenses: 0,
        donationCount: 0,
      }
      const amountMatch = e.name?.match(/\$(\d+(?:\.\d{2})?)/)
      const amount = amountMatch ? parseFloat(amountMatch[1]) : 0
      monthlyMap.set(key, {
        ...existing,
        expenses: existing.expenses + amount,
      })
    }

    const monthly = Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, values]) => ({ month: key, ...values }))

    // Income by donation type
    const typeMap = new Map<string, { total: number; count: number }>()
    for (const d of completedDonations) {
      const type = d.payment_method || 'Unspecified'
      const existing = typeMap.get(type) || { total: 0, count: 0 }
      typeMap.set(type, {
        total: existing.total + (d.amount || 0),
        count: existing.count + 1,
      })
    }

    const incomeByType = Array.from(typeMap.entries())
      .map(([type, values]) => ({
        type,
        ...values,
        pct: totalIncome > 0 ? (values.total / totalIncome) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total)

    // Donor summary
    const donorMap = new Map<
      string,
      { total: number; count: number; email?: string }
    >()
    for (const d of completedDonations) {
      const name = d.donor_name || 'Anonymous'
      const existing = donorMap.get(name) || { total: 0, count: 0 }
      donorMap.set(name, {
        total: existing.total + (d.amount || 0),
        count: existing.count + 1,
        email: d.donor_email || existing.email,
      })
    }

    const donors = Array.from(donorMap.entries())
      .map(([name, values]) => ({ name, ...values }))
      .sort((a, b) => b.total - a.total)

    // Available years
    const yearSet = new Set<number>()
    yearSet.add(new Date().getFullYear())
    for (const d of allDonations) {
      yearSet.add(new Date(d.created_at).getFullYear())
    }
    for (const e of allExpenses) {
      yearSet.add(new Date(e.created_at).getFullYear())
    }

    return NextResponse.json({
      year,
      availableYears: Array.from(yearSet).sort((a, b) => b - a),
      summary: {
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        pendingIncome,
        completedCount: completedDonations.length,
        pendingCount: pendingDonations.length,
        expenseCount: yearExpenses.length,
      },
      monthly,
      incomeByType,
      donors,
      expenses: yearExpenses,
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch financial data'
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
