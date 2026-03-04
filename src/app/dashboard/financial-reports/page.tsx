'use client'

import { useState, useMemo } from 'react'
import {
  BarChart3,
  Download,
  Loader2,
  DollarSign,
  Clock,
  TrendingUp,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getThemeClasses } from '@/lib/themes'
import { useDonations, Donation } from '@/hooks/useData'

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

function getMonthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
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

interface MonthRow {
  key: string
  label: string
  total: number
  count: number
  avg: number
  pct: number
}

interface PaymentMethodRow {
  method: string
  count: number
  total: number
  pct: number
}

interface DonorRow {
  name: string
  total: number
  count: number
  firstDate: string
  lastDate: string
  type: string
}

export default function FinancialReportsPage() {
  const { data: donations, isLoading } = useDonations()

  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)

  const list: Donation[] = donations || []

  // Derive available years from data
  const availableYears = useMemo(() => {
    const years = new Set<number>()
    years.add(currentYear)
    list.forEach((d) => {
      const y = new Date(d.created_at).getFullYear()
      years.add(y)
    })
    return Array.from(years).sort((a, b) => b - a)
  }, [list, currentYear])

  // Filter by selected year
  const yearDonations = useMemo(
    () => list.filter((d) => new Date(d.created_at).getFullYear() === selectedYear),
    [list, selectedYear]
  )

  // Top-level stats (based on selected year)
  const completedYearDonations = yearDonations.filter((d) => d.status === 'completed')
  const pendingYearDonations = yearDonations.filter((d) => d.status === 'pending')

  const totalRevenue = completedYearDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
  const pendingTotal = pendingYearDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
  const avgGiftSize =
    completedYearDonations.length > 0 ? totalRevenue / completedYearDonations.length : 0
  const recurringCount = yearDonations.filter((d) => d.type === 'recurring').length
  const oneTimeCount = yearDonations.filter((d) => d.type === 'one-time').length

  // Monthly breakdown
  const monthlyData = useMemo((): MonthRow[] => {
    const map = new Map<string, { total: number; count: number }>()
    completedYearDonations.forEach((d) => {
      const date = new Date(d.created_at)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const existing = map.get(key) || { total: 0, count: 0 }
      map.set(key, { total: existing.total + (d.amount || 0), count: existing.count + 1 })
    })
    const sorted = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    return sorted.map(([key, { total, count }]) => {
      const [year, month] = key.split('-').map(Number)
      return {
        key,
        label: getMonthLabel(year, month),
        total,
        count,
        avg: count > 0 ? total / count : 0,
        pct: totalRevenue > 0 ? (total / totalRevenue) * 100 : 0,
      }
    })
  }, [completedYearDonations, totalRevenue])

  // Payment method summary
  const paymentMethodData = useMemo((): PaymentMethodRow[] => {
    const map = new Map<string, { count: number; total: number }>()
    completedYearDonations.forEach((d) => {
      const method = d.payment_method || 'Unspecified'
      const existing = map.get(method) || { count: 0, total: 0 }
      map.set(method, { count: existing.count + 1, total: existing.total + (d.amount || 0) })
    })
    return Array.from(map.entries())
      .map(([method, { count, total }]) => ({
        method,
        count,
        total,
        pct: totalRevenue > 0 ? (total / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total)
  }, [completedYearDonations, totalRevenue])

  // Donor summary (all time, not year-filtered, to show full donor history)
  const donorData = useMemo((): DonorRow[] => {
    const map = new Map<
      string,
      { total: number; count: number; dates: string[]; types: Set<string> }
    >()
    list
      .filter((d) => d.status === 'completed')
      .forEach((d) => {
        const name = d.donor_name || 'Anonymous'
        const existing = map.get(name) || { total: 0, count: 0, dates: [], types: new Set() }
        existing.total += d.amount || 0
        existing.count += 1
        existing.dates.push(d.created_at)
        existing.types.add(d.type)
        map.set(name, existing)
      })
    return Array.from(map.entries())
      .map(([name, { total, count, dates, types }]) => {
        const sorted = dates.sort()
        return {
          name,
          total,
          count,
          firstDate: new Date(sorted[0]).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          lastDate: new Date(sorted[sorted.length - 1]).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          type: types.has('recurring') ? 'Recurring' : 'One-time',
        }
      })
      .sort((a, b) => b.total - a.total)
  }, [list])

  const handleExportMonthly = () => {
    exportCsv(
      `financial-report-monthly-${selectedYear}.csv`,
      ['Month', 'Total Amount', '# Donations', 'Avg Amount', '% of Annual'],
      monthlyData.map((r) => [
        r.label,
        r.total.toFixed(2),
        r.count,
        r.avg.toFixed(2),
        r.pct.toFixed(1) + '%',
      ])
    )
  }

  const handleExportPaymentMethods = () => {
    exportCsv(
      `financial-report-payment-methods-${selectedYear}.csv`,
      ['Payment Method', '# Donations', 'Total Amount', '% of Revenue'],
      paymentMethodData.map((r) => [
        r.method,
        r.count,
        r.total.toFixed(2),
        r.pct.toFixed(1) + '%',
      ])
    )
  }

  const handleExportDonors = () => {
    exportCsv(
      `financial-report-donors-all-time.csv`,
      ['Donor Name', 'Total Given', '# Donations', 'First Gift Date', 'Last Gift Date', 'Type'],
      donorData.map((r) => [r.name, r.total.toFixed(2), r.count, r.firstDate, r.lastDate, r.type])
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-700" />
      </div>
    )
  }

  if (list.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', classes.bgLight)}>
            <BarChart3 className={cn('w-5 h-5', classes.textPrimary)} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
            <p className="text-gray-500 text-sm">Donation analytics and financial summaries</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <div className={cn('inline-flex p-4 rounded-full mb-4', classes.bgLight)}>
            <BarChart3 className={cn('w-10 h-10', classes.textPrimary)} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No financial data available yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto text-sm">
            Record donations to generate reports. Financial summaries will appear here once
            donations are logged.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className={cn('p-2 rounded-lg', classes.bgLight)}>
              <BarChart3 className={cn('w-5 h-5', classes.textPrimary)} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          </div>
          <p className="text-gray-500 ml-11 text-sm">
            Donation analytics and giving summaries for Sacred Revelation Ministry Trust
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-gray-400 mt-0.5">Completed donations in {selectedYear}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Contributions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(pendingTotal)}</p>
              <p className="text-xs text-gray-400 mt-0.5">{pendingYearDonations.length} awaiting</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Gift Size</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(avgGiftSize)}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Based on {completedYearDonations.length} completed gifts
              </p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <TrendingUp className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Recurring vs One-time</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {recurringCount} / {oneTimeCount}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Recurring / One-time in {selectedYear}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <RefreshCw className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Monthly Breakdown</h2>
            <p className="text-xs text-gray-500 mt-0.5">Completed donations grouped by month for {selectedYear}</p>
          </div>
          <button
            onClick={handleExportMonthly}
            disabled={monthlyData.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
        {monthlyData.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">
            No completed donations found for {selectedYear}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    # Donations
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Amount
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % of Annual
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {monthlyData.map((row) => (
                  <tr key={row.key} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.label}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                      {formatCurrencyFull(row.total)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600">{row.count}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600">
                      {formatCurrencyFull(row.avg)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full', classes.bgPrimary)}
                            style={{ width: `${Math.min(row.pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-10 text-right">
                          {row.pct.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td className="px-6 py-3 text-sm font-semibold text-gray-700">Total</td>
                  <td className="px-6 py-3 text-sm font-bold text-right text-gray-900">
                    {formatCurrencyFull(totalRevenue)}
                  </td>
                  <td className="px-6 py-3 text-sm font-semibold text-right text-gray-700">
                    {completedYearDonations.length}
                  </td>
                  <td className="px-6 py-3 text-sm font-semibold text-right text-gray-700">
                    {formatCurrencyFull(avgGiftSize)}
                  </td>
                  <td className="px-6 py-3 text-sm font-semibold text-right text-gray-700">
                    100.0%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Two-column: Payment Methods + Donor Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Method Summary */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Payment Methods</h2>
              <p className="text-xs text-gray-500 mt-0.5">Breakdown by payment type for {selectedYear}</p>
            </div>
            <button
              onClick={handleExportPaymentMethods}
              disabled={paymentMethodData.length === 0}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
          {paymentMethodData.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-400">
              No data available for {selectedYear}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paymentMethodData.map((row) => (
                    <tr key={row.method} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-sm font-medium text-gray-900 capitalize">
                        {row.method}
                      </td>
                      <td className="px-5 py-3 text-sm text-right text-gray-600">{row.count}</td>
                      <td className="px-5 py-3 text-sm text-right font-semibold text-gray-900">
                        {formatCurrencyFull(row.total)}
                      </td>
                      <td className="px-5 py-3 text-sm text-right text-gray-600">
                        {row.pct.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Stats Panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Giving Summary - {selectedYear}</h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Completed Gifts</span>
              <span className="text-sm font-semibold text-gray-900">
                {completedYearDonations.length}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Pending Gifts</span>
              <span className="text-sm font-semibold text-yellow-700">
                {pendingYearDonations.length}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Total Completed Revenue</span>
              <span className="text-sm font-bold text-gray-900">{formatCurrencyFull(totalRevenue)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Pending Revenue</span>
              <span className="text-sm font-semibold text-yellow-700">{formatCurrencyFull(pendingTotal)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Average Gift</span>
              <span className="text-sm font-semibold text-gray-900">{formatCurrencyFull(avgGiftSize)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Recurring Donors</span>
              <span className="text-sm font-semibold text-gray-900">{recurringCount}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-600">One-time Donors</span>
              <span className="text-sm font-semibold text-gray-900">{oneTimeCount}</span>
            </div>
          </div>

          <div className={cn('rounded-lg p-4', classes.bgLight)}>
            <p className="text-xs font-medium text-purple-900 mb-1">Note</p>
            <p className="text-xs text-purple-700">
              Revenue figures include only completed donations. Pending and failed transactions are
              excluded from totals.
            </p>
          </div>
        </div>
      </div>

      {/* Donor Summary Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Donor Summary</h2>
            <p className="text-xs text-gray-500 mt-0.5">All-time giving records by donor (completed donations only)</p>
          </div>
          <button
            onClick={handleExportDonors}
            disabled={donorData.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
        {donorData.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">
            No donor records to display.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donor Name
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Given
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    # Donations
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    First Gift
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Gift
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {donorData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.name}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                      {formatCurrencyFull(row.total)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600">{row.count}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.firstDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.lastDate}</td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          row.type === 'Recurring'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-700'
                        )}
                      >
                        {row.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
              {donorData.length} donor{donorData.length !== 1 ? 's' : ''} total (all-time)
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
