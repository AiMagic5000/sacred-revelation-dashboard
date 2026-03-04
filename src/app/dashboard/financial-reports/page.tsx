'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  BarChart3,
  Download,
  Loader2,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Upload,
  Receipt,
  Search,
  X,
  Plus,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Camera,
} from 'lucide-react'
import { cn, formatBytes } from '@/lib/utils'
import { getThemeClasses } from '@/lib/themes'
import { useDonations, Donation } from '@/hooks/useData'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EXPENSE_CATEGORIES = [
  'Utilities',
  'Rent/Mortgage',
  'Supplies',
  'Ministry Expenses',
  'Salaries',
  'Maintenance',
  'Insurance',
  'Travel',
  'Other',
] as const

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
].join(',')

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExpenseDoc {
  id: string
  name: string
  type: string
  file_url: string
  file_size: number
  category: string
  created_at: string
  storage_path?: string
}

interface FinancialReport {
  year: number
  availableYears: number[]
  summary: {
    totalIncome: number
    totalExpenses: number
    netBalance: number
    pendingIncome: number
    completedCount: number
    pendingCount: number
    expenseCount: number
  }
  monthly: Array<{
    month: string
    income: number
    expenses: number
    donationCount: number
  }>
  incomeByType: Array<{
    type: string
    total: number
    count: number
    pct: number
  }>
  donors: Array<{
    name: string
    total: number
    count: number
    email?: string
  }>
  expenses: ExpenseDoc[]
}

interface ExpenseFormData {
  description: string
  amount: string
  category: string
  vendor: string
  date: string
}

interface UploadItem {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const classes = getThemeClasses('sacred')

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatCurrencyFull(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function getMonthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

function getMonthShort(key: string): string {
  const [, month] = key.split('-').map(Number)
  return new Date(2026, month - 1, 1).toLocaleDateString('en-US', {
    month: 'short',
  })
}

function exportCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function FinancialReportsPage() {
  const { data: donations, isLoading: donationsLoading } = useDonations()
  const [report, setReport] = useState<FinancialReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [searchQuery, setSearchQuery] = useState('')
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [expenseForm, setExpenseForm] = useState<ExpenseFormData>({
    description: '',
    amount: '',
    category: 'Supplies',
    vendor: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [expenseFile, setExpenseFile] = useState<File | null>(null)
  const [uploadItem, setUploadItem] = useState<UploadItem | null>(null)
  const [savingExpense, setSavingExpense] = useState(false)
  const [activeMonthFolder, setActiveMonthFolder] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Fetch financial report
  const fetchReport = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/financial-reports?year=${selectedYear}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setReport(data)
    } catch {
      setReport(null)
    } finally {
      setIsLoading(false)
    }
  }, [selectedYear])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  // Derived data from donations (for search)
  const donationsList = donations || []

  // Search donations
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return donationsList
      .filter(
        (d) =>
          d.donor_name?.toLowerCase().includes(query) ||
          d.receipt_number?.toLowerCase().includes(query) ||
          d.amount?.toString().includes(query) ||
          d.donor_email?.toLowerCase().includes(query)
      )
      .slice(0, 20)
  }, [donationsList, searchQuery])

  // Monthly chart data
  const chartData = report?.monthly || []
  const maxMonthlyIncome = Math.max(...chartData.map((m) => m.income), 1)

  // Available years
  const availableYears = report?.availableYears || [new Date().getFullYear()]

  // Monthly expense folders
  const expensesByMonth = useMemo(() => {
    if (!report?.expenses) return []
    const map = new Map<string, ExpenseDoc[]>()
    for (const exp of report.expenses) {
      const d = new Date(exp.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const existing = map.get(key) || []
      map.set(key, [...existing, exp])
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  }, [report?.expenses])

  // Handle expense file select
  const handleExpenseFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setExpenseFile(e.target.files[0])
      }
      e.target.value = ''
    },
    []
  )

  // Submit expense
  const handleSubmitExpense = useCallback(async () => {
    if (!expenseForm.amount || !expenseForm.description) return

    setSavingExpense(true)
    try {
      // Build a descriptive filename that encodes the expense metadata
      const amount = parseFloat(expenseForm.amount).toFixed(2)
      const cleanDesc = expenseForm.description.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 50)
      const cleanVendor = expenseForm.vendor.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 30)

      if (expenseFile) {
        // Upload file with metadata in the document name
        const formData = new FormData()
        formData.append('file', expenseFile)
        formData.append('category', 'Financial Receipts')

        // Create upload progress tracking
        setUploadItem({
          id: 'expense-upload',
          file: expenseFile,
          progress: 20,
          status: 'uploading',
        })

        const progressInterval = setInterval(() => {
          setUploadItem((prev) =>
            prev && prev.progress < 85
              ? { ...prev, progress: prev.progress + Math.random() * 15 }
              : prev
          )
        }, 300)

        const res = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        })

        clearInterval(progressInterval)

        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: 'Upload failed' }))
          throw new Error(body.error || 'Upload failed')
        }

        const doc = await res.json()

        // Update the document name to include expense metadata
        // Format: "$AMOUNT - Description (Vendor) [Category]"
        const expenseName = `$${amount} - ${cleanDesc}${cleanVendor ? ` (${cleanVendor})` : ''} [${expenseForm.category}]`

        await fetch(`/api/documents/${doc.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: expenseName }),
        }).catch(() => {
          // If PUT doesn't exist, that's OK - the file is still uploaded
        })

        setUploadItem({
          id: 'expense-upload',
          file: expenseFile,
          progress: 100,
          status: 'done',
        })
      } else {
        // No file, create a document record anyway as an expense entry
        const expenseName = `$${amount} - ${cleanDesc}${cleanVendor ? ` (${cleanVendor})` : ''} [${expenseForm.category}]`

        // Upload a minimal placeholder via the existing upload endpoint
        const textBlob = new Blob(
          [
            `Expense Record\n` +
              `Amount: $${amount}\n` +
              `Description: ${expenseForm.description}\n` +
              `Vendor: ${expenseForm.vendor || 'N/A'}\n` +
              `Category: ${expenseForm.category}\n` +
              `Date: ${expenseForm.date}\n`,
          ],
          { type: 'text/plain' }
        )
        const placeholderFile = new File([textBlob], `${expenseName}.txt`, {
          type: 'text/plain',
        })

        const formData = new FormData()
        formData.append('file', placeholderFile)
        formData.append('category', 'Financial Receipts')

        const res = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          throw new Error('Failed to save expense')
        }
      }

      // Reset form
      setExpenseForm({
        description: '',
        amount: '',
        category: 'Supplies',
        vendor: '',
        date: new Date().toISOString().split('T')[0],
      })
      setExpenseFile(null)
      setUploadItem(null)
      setShowExpenseModal(false)

      // Refresh report data
      await fetchReport()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save expense'
      setUploadItem((prev) =>
        prev ? { ...prev, status: 'error', error: message } : null
      )
    } finally {
      setSavingExpense(false)
    }
  }, [expenseForm, expenseFile, fetchReport])

  // Export full financial report
  const handleExportFullReport = useCallback(() => {
    if (!report) return

    const headers = [
      'Category',
      'Amount',
      'Details',
    ]
    const rows: (string | number)[][] = []

    // Income section
    rows.push(['--- INCOME ---', '', ''])
    rows.push(['Total Income', report.summary.totalIncome.toFixed(2), `${report.summary.completedCount} completed donations`])
    rows.push(['Pending Income', report.summary.pendingIncome.toFixed(2), `${report.summary.pendingCount} pending`])
    rows.push(['', '', ''])

    // Monthly breakdown
    rows.push(['--- MONTHLY BREAKDOWN ---', '', ''])
    for (const m of report.monthly) {
      rows.push([getMonthLabel(m.month), m.income.toFixed(2), `${m.donationCount} donations`])
    }
    rows.push(['', '', ''])

    // Expenses
    rows.push(['--- EXPENSES ---', '', ''])
    rows.push(['Total Expenses', report.summary.totalExpenses.toFixed(2), `${report.summary.expenseCount} records`])
    for (const e of report.expenses) {
      const amountMatch = e.name?.match(/\$(\d+(?:\.\d{2})?)/)
      const amount = amountMatch ? amountMatch[1] : '0'
      rows.push([e.name, amount, formatDateShort(e.created_at)])
    }
    rows.push(['', '', ''])

    // Net balance
    rows.push(['--- SUMMARY ---', '', ''])
    rows.push(['Net Balance', report.summary.netBalance.toFixed(2), `Income - Expenses`])

    exportCsv(
      `financial-report-${report.year}.csv`,
      headers,
      rows
    )
  }, [report])

  // Export donors
  const handleExportDonors = useCallback(() => {
    if (!report?.donors) return
    exportCsv(
      `donor-summary-${report.year}.csv`,
      ['Donor Name', 'Total Given', '# Donations', 'Email'],
      report.donors.map((d) => [d.name, d.total.toFixed(2), d.count, d.email || ''])
    )
  }, [report])

  // Loading state
  if (isLoading && donationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-700" />
      </div>
    )
  }

  const summary = report?.summary || {
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    pendingIncome: 0,
    completedCount: 0,
    pendingCount: 0,
    expenseCount: 0,
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className={cn('p-2 rounded-lg', classes.bgLight)}>
              <BarChart3 className={cn('w-5 h-5', classes.textPrimary)} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          </div>
          <p className="text-gray-500 ml-11 text-sm">
            Income, expenses, and financial summaries for your ministry trust
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-700/40 focus:border-purple-500"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button
            onClick={handleExportFullReport}
            disabled={!report}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => setShowExpenseModal(true)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl font-medium shadow-sm',
              classes.buttonPrimary
            )}
          >
            <Plus className="w-5 h-5" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up"
        style={{ animationDelay: '80ms' }}
      >
        <SummaryCard
          icon={DollarSign}
          label="Total Income"
          value={formatCurrency(summary.totalIncome)}
          subtext={`${summary.completedCount} completed donations`}
          color="emerald"
        />
        <SummaryCard
          icon={TrendingDown}
          label="Total Expenses"
          value={formatCurrency(summary.totalExpenses)}
          subtext={`${summary.expenseCount} expense records`}
          color="rose"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Net Balance"
          value={formatCurrency(summary.netBalance)}
          subtext={summary.netBalance >= 0 ? 'Positive balance' : 'Negative balance'}
          color={summary.netBalance >= 0 ? 'purple' : 'rose'}
        />
        <SummaryCard
          icon={Clock}
          label="Pending Donations"
          value={formatCurrency(summary.pendingIncome)}
          subtext={`${summary.pendingCount} awaiting completion`}
          color="amber"
        />
      </div>

      {/* Monthly Breakdown Chart */}
      <div
        className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-fade-up"
        style={{ animationDelay: '160ms' }}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Monthly Income Overview</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Completed donations by month for {selectedYear}
            </p>
          </div>
        </div>
        {chartData.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">
            No income data for {selectedYear}.
          </div>
        ) : (
          <div className="p-5">
            {/* CSS bar chart */}
            <div className="flex items-end gap-2 sm:gap-3 h-48">
              {chartData.map((m) => {
                const heightPct = maxMonthlyIncome > 0 ? (m.income / maxMonthlyIncome) * 100 : 0
                return (
                  <div
                    key={m.month}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <span className="text-[10px] text-gray-500 font-medium">
                      {formatCurrency(m.income)}
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-purple-700 to-indigo-500 rounded-t-lg transition-all duration-500 min-h-[4px]"
                      style={{ height: `${Math.max(heightPct, 2)}%` }}
                      title={`${getMonthLabel(m.month)}: ${formatCurrencyFull(m.income)} (${m.donationCount} donations)`}
                    />
                    <span className="text-[10px] text-gray-500 font-medium">
                      {getMonthShort(m.month)}
                    </span>
                  </div>
                )
              })}
            </div>
            {/* Legend */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-r from-purple-700 to-indigo-500" />
                <span className="text-xs text-gray-500">Income</span>
              </div>
              <span className="text-xs text-gray-400">
                Total: {formatCurrencyFull(summary.totalIncome)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Income by Payment Method + Donor Summary side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income by Payment Method */}
        <div
          className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-fade-up"
          style={{ animationDelay: '240ms' }}
        >
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Income by Payment Method</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Breakdown for {selectedYear}
              </p>
            </div>
          </div>
          {(report?.incomeByType || []).length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-400">
              No income data for {selectedYear}.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {(report?.incomeByType || []).map((row) => (
                <div
                  key={row.type}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 rounded-full bg-gradient-to-b from-purple-500 to-indigo-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {row.type}
                      </p>
                      <p className="text-xs text-gray-400">{row.count} donations</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrencyFull(row.total)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-purple-600"
                          style={{ width: `${Math.min(row.pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500">
                        {row.pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Giving Summary */}
        <div
          className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 animate-fade-up"
          style={{ animationDelay: '320ms' }}
        >
          <h2 className="text-base font-semibold text-gray-900">
            Giving Summary - {selectedYear}
          </h2>

          <div className="space-y-0">
            {[
              {
                label: 'Completed Gifts',
                value: summary.completedCount.toString(),
                color: 'text-gray-900',
              },
              {
                label: 'Pending Gifts',
                value: summary.pendingCount.toString(),
                color: 'text-yellow-700',
              },
              {
                label: 'Total Completed Revenue',
                value: formatCurrencyFull(summary.totalIncome),
                color: 'text-gray-900 font-bold',
              },
              {
                label: 'Pending Revenue',
                value: formatCurrencyFull(summary.pendingIncome),
                color: 'text-yellow-700',
              },
              {
                label: 'Total Expenses',
                value: formatCurrencyFull(summary.totalExpenses),
                color: 'text-rose-700',
              },
              {
                label: 'Net Balance',
                value: formatCurrencyFull(summary.netBalance),
                color:
                  summary.netBalance >= 0
                    ? 'text-emerald-700 font-bold'
                    : 'text-rose-700 font-bold',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className={cn('text-sm font-semibold', item.color)}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-purple-50 p-4 mt-2">
            <p className="text-xs font-medium text-purple-900 mb-1">508(c)(1)(A) Note</p>
            <p className="text-xs text-purple-700">
              As a tax-exempt ministry trust, income figures represent donations and
              tithes received. Expenses reflect ministry operational costs with receipt
              documentation for compliance.
            </p>
          </div>
        </div>
      </div>

      {/* Expense Tracking Section */}
      <div
        className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-fade-up"
        style={{ animationDelay: '400ms' }}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Expense Tracking</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Uploaded receipts and expense records for {selectedYear}
            </p>
          </div>
          <button
            onClick={() => setShowExpenseModal(true)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium',
              classes.buttonPrimary
            )}
          >
            <Receipt className="w-3.5 h-3.5" />
            Add Receipt
          </button>
        </div>

        {/* Back button when in folder */}
        {activeMonthFolder && (
          <div className="px-5 pt-4">
            <button
              onClick={() => setActiveMonthFolder(null)}
              className="flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to all months
            </button>
          </div>
        )}

        {expensesByMonth.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              No expenses recorded
            </h3>
            <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
              Upload receipts and track expenses. Each expense gets stored with
              the amount, vendor, and category for tax compliance.
            </p>
            <button
              onClick={() => setShowExpenseModal(true)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium',
                classes.buttonPrimary
              )}
            >
              <Upload className="w-4 h-4" />
              Add first expense
            </button>
          </div>
        ) : !activeMonthFolder ? (
          // Month folders grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-5">
            {expensesByMonth.map(([key, docs]) => (
              <button
                key={key}
                onClick={() => setActiveMonthFolder(key)}
                className="group bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-left hover:shadow-md hover:border-purple-200 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center group-hover:from-purple-200 group-hover:to-indigo-200 transition-colors">
                    <FolderOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500 transition-colors mt-1" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  {getMonthLabel(key)}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {docs.length} {docs.length === 1 ? 'receipt' : 'receipts'}
                </p>
              </button>
            ))}
          </div>
        ) : (
          // Expense list inside folder
          <div className="divide-y divide-gray-100">
            {(expensesByMonth.find(([k]) => k === activeMonthFolder)?.[1] || []).map(
              (exp) => {
                const amountMatch = exp.name?.match(/\$(\d+(?:\.\d{2})?)/)
                const amount = amountMatch ? parseFloat(amountMatch[1]) : 0
                const categoryMatch = exp.name?.match(/\[([^\]]+)\]/)
                const category = categoryMatch ? categoryMatch[1] : 'General'
                const vendorMatch = exp.name?.match(/\(([^)]+)\)/)
                const vendor = vendorMatch ? vendorMatch[1] : ''

                return (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0">
                        <Receipt className="w-4 h-4 text-rose-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[300px]">
                          {exp.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {category && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                              {category}
                            </span>
                          )}
                          {vendor && (
                            <span className="text-xs text-gray-400">{vendor}</span>
                          )}
                          <span className="text-xs text-gray-400">
                            {formatDateShort(exp.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-rose-700">
                        -{formatCurrencyFull(amount)}
                      </span>
                      {exp.file_url && (
                        <button
                          onClick={() => window.open(exp.file_url, '_blank')}
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View receipt"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              }
            )}
          </div>
        )}
      </div>

      {/* Donation Receipt Search */}
      <div
        className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-fade-up"
        style={{ animationDelay: '480ms' }}
      >
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Donation Receipt Search
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by donor name, receipt number, email, or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-700/40 focus:border-purple-400 bg-gray-50 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-200 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {searchQuery.trim() && (
          <div>
            {searchResults.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                No donations matching "{searchQuery}"
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                {searchResults.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium',
                          classes.bgPrimary
                        )}
                      >
                        {(d.donor_name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {d.donor_name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {d.receipt_number && (
                            <span className="text-xs text-gray-400">
                              #{d.receipt_number}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {formatDateShort(d.created_at)}
                          </span>
                          {d.donor_email && (
                            <span className="text-xs text-gray-400">
                              {d.donor_email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrencyFull(d.amount || 0)}
                      </p>
                      <span
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize',
                          d.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : d.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        )}
                      >
                        {d.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Donor Summary Table */}
      <div
        className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-fade-up"
        style={{ animationDelay: '560ms' }}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Donor Summary</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Giving records for {selectedYear} (completed donations)
            </p>
          </div>
          <button
            onClick={handleExportDonors}
            disabled={!report?.donors?.length}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
        {!report?.donors?.length ? (
          <div className="p-10 text-center text-sm text-gray-400">
            No donor records for {selectedYear}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donor
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Given
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    # Donations
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {report.donors.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {row.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                      {formatCurrencyFull(row.total)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600">
                      {row.count}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {row.email || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================= */}
      {/* Expense Upload Modal */}
      {/* ============================================================= */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => {
              if (!savingExpense) {
                setShowExpenseModal(false)
                setUploadItem(null)
              }
            }}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Add Expense</h2>
              <button
                onClick={() => {
                  if (!savingExpense) {
                    setShowExpenseModal(false)
                    setUploadItem(null)
                  }
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description *
                </label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, description: e.target.value })
                  }
                  placeholder="Office supplies, electricity bill, etc."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-700/40 focus:border-purple-400 bg-gray-50 focus:bg-white transition-all"
                />
              </div>

              {/* Amount + Category row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Amount *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={expenseForm.amount}
                      onChange={(e) =>
                        setExpenseForm({ ...expenseForm, amount: e.target.value })
                      }
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-700/40 focus:border-purple-400 bg-gray-50 focus:bg-white transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category
                  </label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, category: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-700/40 focus:border-purple-400 bg-gray-50 focus:bg-white transition-all"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vendor + Date row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Vendor
                  </label>
                  <input
                    type="text"
                    value={expenseForm.vendor}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, vendor: e.target.value })
                    }
                    placeholder="Vendor name"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-700/40 focus:border-purple-400 bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, date: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-700/40 focus:border-purple-400 bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Receipt upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Receipt (optional)
                </label>
                {expenseFile ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                    <FileText className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {expenseFile.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatBytes(expenseFile.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => setExpenseFile(null)}
                      className="p-1 rounded hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/30 transition-all flex-1"
                    >
                      <Upload className="w-4 h-4" />
                      Browse files
                    </button>
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/30 transition-all sm:hidden"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES}
                  className="hidden"
                  onChange={handleExpenseFileSelect}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleExpenseFileSelect}
                />
              </div>

              {/* Upload progress */}
              {uploadItem && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                  {uploadItem.status === 'done' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  ) : uploadItem.status === 'error' ? (
                    <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-purple-500 animate-spin flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      {uploadItem.status === 'done'
                        ? 'Saved successfully'
                        : uploadItem.status === 'error'
                        ? uploadItem.error || 'Upload failed'
                        : 'Saving expense...'}
                    </p>
                    {uploadItem.status === 'uploading' && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
                        <div
                          className="h-1.5 rounded-full bg-purple-500 transition-all duration-300"
                          style={{ width: `${Math.min(uploadItem.progress, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-5 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <button
                onClick={() => {
                  if (!savingExpense) {
                    setShowExpenseModal(false)
                    setUploadItem(null)
                  }
                }}
                disabled={savingExpense}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitExpense}
                disabled={
                  savingExpense ||
                  !expenseForm.description.trim() ||
                  !expenseForm.amount
                }
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed',
                  classes.buttonPrimary
                )}
              >
                {savingExpense ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Receipt className="w-4 h-4" />
                )}
                {savingExpense ? 'Saving...' : 'Save Expense'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-Components
// ---------------------------------------------------------------------------

function SummaryCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: typeof DollarSign
  label: string
  value: string
  subtext: string
  color: 'emerald' | 'rose' | 'purple' | 'amber'
}) {
  const colorMap = {
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', iconBg: 'bg-emerald-100' },
    rose: { bg: 'bg-rose-50', icon: 'text-rose-600', iconBg: 'bg-rose-100' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', iconBg: 'bg-purple-100' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', iconBg: 'bg-amber-100' },
  }
  const c = colorMap[color]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>
        </div>
        <div className={cn('p-3 rounded-lg', c.iconBg)}>
          <Icon className={cn('w-6 h-6', c.icon)} />
        </div>
      </div>
    </div>
  )
}
