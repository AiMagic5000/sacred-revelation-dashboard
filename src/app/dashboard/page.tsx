'use client'

import { useState } from 'react'
import {
  DollarSign,
  Users,
  Sparkles,
  Church,
  TrendingUp,
  Plus,
  Receipt,
  Upload,
  ChevronLeft,
  ChevronRight,
  Mic,
  CheckCircle2,
  Circle,
  Phone,
  Mail,
  Calendar,
  CalendarPlus,
  Shield,
  BookOpen,
  ExternalLink,
  Loader2,
  Heart,
  ArrowUpRight,
  UserPlus,
  ClipboardCheck,
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import {
  useDashboardStats,
  useDonations,
  usePartners,
  useCompliance,
  useVolunteers,
} from '@/hooks/useData'

// ---------------------------------------------------------------------------
// Page Constants
// ---------------------------------------------------------------------------

const SCRIPTURE_VERSE =
  '"A good man leaves an inheritance to his children\'s children" -- Proverbs 13:22'

const MINISTRY_INFO = {
  name: 'Sacred Revelation, A Free Church',
  formationDate: 'August 7, 2025',
  ein: '39-7070XX',
  state: 'California',
  structure: '508(c)(1)(A) Free Church',
  presidingElder: 'Patricia Kay Ward',
  status: 'Active',
} as const

const LEADERSHIP_TEAM = [
  {
    name: 'Patricia Kay Ward',
    role: 'Presiding Elder / Founder',
    email: 'patricia@sacredrevelation.org',
    phone: '(916) 555-0101',
    joined: 'Aug 2025',
    status: 'Active',
    bio: 'BA in Interpersonal Communications, 30+ years music ministry, CalPERS analyst, certified natural health & homeopathy',
  },
  {
    name: 'Michael C. Ward',
    role: 'Elder',
    email: 'michael@sacredrevelation.org',
    phone: '(916) 555-0102',
    joined: 'Aug 2025',
    status: 'Active',
    bio: 'Elder board member, multi-generational stewardship',
  },
  {
    name: 'To Be Appointed',
    role: 'Elder / Board Member',
    email: '--',
    phone: '--',
    joined: '--',
    status: 'Pending',
    bio: 'Position open for qualified elder candidate',
  },
] as const

const ACTIVITY_CATEGORIES = ['Ministry', 'Donation', 'Healing', 'Worship'] as const

const FALLBACK_COMPLIANCE = [
  { label: 'IRS 14-Factor Compliance', status: 'complete' as const, date: 'Aug 7, 2025' },
  { label: 'Annual Ministry Review', status: 'pending' as const, dueDate: 'Aug 7, 2026' },
  { label: 'Financial Records Updated', status: 'complete' as const, date: 'Feb 28, 2026' },
  { label: 'Board Meeting Minutes Filed', status: 'pending' as const, dueDate: 'Mar 31, 2026' },
  { label: 'Beneficiary Distribution Log', status: 'pending' as const, dueDate: 'Jun 30, 2026' },
] as const

const MONTHLY_GIVING = [
  { month: 'Apr', value: 1200 },
  { month: 'May', value: 1850 },
  { month: 'Jun', value: 2400 },
  { month: 'Jul', value: 1950 },
  { month: 'Aug', value: 3200 },
  { month: 'Sep', value: 2800 },
  { month: 'Oct', value: 3600 },
  { month: 'Nov', value: 4100 },
  { month: 'Dec', value: 5200 },
  { month: 'Jan', value: 3800 },
  { month: 'Feb', value: 4500 },
  { month: 'Mar', value: 4900 },
]

// ---------------------------------------------------------------------------
// Dashboard Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [chartPeriod, setChartPeriod] = useState<'month' | 'quarter' | 'year'>('year')
  const [txPage, setTxPage] = useState(0)
  const [activityText, setActivityText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: donations, isLoading: donationsLoading } = useDonations()
  const { data: partners } = usePartners()
  const { data: compliance } = useCompliance()
  const { data: volunteers } = useVolunteers()

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const totalGiving = stats?.stats?.totalDonations || 0
  const partnerCount = stats?.stats?.partnersCount || partners?.length || 28
  const activeVolunteers = stats?.stats?.activeVolunteers || volunteers?.filter(v => v.status === 'active').length || 0
  const programCount = 6

  const PAGE_SIZE = 6
  const recentTransactions =
    donations?.map((d) => ({
      id: d.id,
      name: d.donor_name,
      category: d.notes || 'General Giving',
      date: new Date(d.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      amount: d.amount,
      status: d.status === 'completed' ? ('Completed' as const) : ('Pending' as const),
    })) || []

  const totalTxPages = Math.max(1, Math.ceil(recentTransactions.length / PAGE_SIZE))
  const paginatedTx = recentTransactions.slice(txPage * PAGE_SIZE, (txPage + 1) * PAGE_SIZE)

  const complianceItems =
    compliance?.slice(0, 5).map((c) => ({
      label: c.title,
      status: c.status === 'completed' ? ('complete' as const) : ('pending' as const),
      date: c.completed_at
        ? new Date(c.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : undefined,
      dueDate: c.due_date
        ? new Date(c.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : undefined,
    })) || [...FALLBACK_COMPLIANCE]

  const completedCount = complianceItems.filter((c) => c.status === 'complete').length
  const compliancePercent = Math.round((completedCount / complianceItems.length) * 100)

  // Chart data
  const maxChartValue = Math.max(...MONTHLY_GIVING.map((m) => m.value))

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* ================================================================== */}
      {/* 1. WELCOME BANNER                                                  */}
      {/* ================================================================== */}
      <div className="rounded-xl p-6 md:p-8 text-white bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome to Sacred Revelation
          </h1>
          <p className="mt-1 text-purple-200 text-sm md:text-base">
            508(c)(1)(A) Free Church Ministry Trust &middot; Sacramento, California
          </p>
          <p className="mt-4 text-purple-100/90 italic text-sm max-w-xl">
            {SCRIPTURE_VERSE}
          </p>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 2. STATS GRID                                                      */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          title="Total Giving"
          value={statsLoading ? null : formatCurrency(totalGiving)}
          subtitle="year-to-date"
          loading={statsLoading}
        />
        <StatCard
          icon={Church}
          title="Partner Organizations"
          value={statsLoading ? null : partnerCount.toString()}
          subtitle="churches & beneficiaries"
          loading={statsLoading}
        />
        <StatCard
          icon={Users}
          title="Active Volunteers"
          value={statsLoading ? null : activeVolunteers.toString()}
          subtitle="serving this month"
          loading={statsLoading}
        />
        <StatCard
          icon={Sparkles}
          title="Ministry Programs"
          value={statsLoading ? null : programCount.toString()}
          subtitle="active programs"
          loading={statsLoading}
        />
      </div>

      {/* ================================================================== */}
      {/* 3. TWO-COLUMN: CHART + MINISTRY INFO                              */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* --- Ministry Impact Chart --- */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Ministry Giving Impact</h2>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['month', 'quarter', 'year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={cn(
                    'px-3 py-1 text-sm font-medium rounded-md transition-colors capitalize',
                    chartPeriod === period
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div className="h-48 flex items-end gap-1.5">
            {MONTHLY_GIVING.map((item) => (
              <div key={item.month} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full rounded-t-md bg-purple-500 hover:bg-purple-600 transition-colors cursor-pointer"
                  style={{ height: `${(item.value / maxChartValue) * 100}%` }}
                  title={`${item.month}: ${formatCurrency(item.value)}`}
                />
                <span className="text-[10px] sm:text-xs text-gray-500 mt-2">{item.month}</span>
              </div>
            ))}
          </div>

          {/* Summary row */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(MONTHLY_GIVING.reduce((s, m) => s + m.value, 0))}
              </p>
              <p className="text-xs text-gray-500">Total Given</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">28</p>
              <p className="text-xs text-gray-500">Beneficiaries Served</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-600">+24%</p>
              <p className="text-xs text-gray-500">Growth</p>
            </div>
          </div>
        </div>

        {/* --- Ministry Information Card --- */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple-50">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Ministry Information</h2>
          </div>

          <div className="space-y-4">
            <InfoRow label="Ministry Name" value={MINISTRY_INFO.name} />
            <InfoRow label="Formation Date" value={MINISTRY_INFO.formationDate} />
            <InfoRow label="EIN" value={MINISTRY_INFO.ein} />
            <InfoRow label="State" value={MINISTRY_INFO.state} />
            <InfoRow label="Structure" value={MINISTRY_INFO.structure} />
            <InfoRow label="Presiding Elder" value={MINISTRY_INFO.presidingElder} />
            <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-500">Status</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {MINISTRY_INFO.status}
              </span>
            </div>
          </div>

          <a
            href="/dashboard/trust-data"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
          >
            View full trust record
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 4. RECENT TRANSACTIONS TABLE                                       */}
      {/* ================================================================== */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <span className="text-sm text-gray-500">
            {donations?.length || 0} total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donor
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {donationsLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-500 mx-auto" />
                    <p className="text-sm text-gray-500 mt-2">Loading transactions...</p>
                  </td>
                </tr>
              ) : paginatedTx.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 rounded-full bg-purple-50">
                        <Heart className="w-6 h-6 text-purple-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">No transactions yet</p>
                      <p className="text-xs text-gray-500">
                        Record your first donation to get started.
                      </p>
                      <a
                        href="/dashboard/donations"
                        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Record Donation
                      </a>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTx.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900">{tx.name}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{tx.category}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{tx.date}</td>
                    <td
                      className={cn(
                        'py-3 px-4 text-sm font-medium text-right',
                        tx.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {tx.amount >= 0 ? '+' : ''}
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          tx.status === 'Completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        )}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            {recentTransactions.length > 0
              ? `Showing ${txPage * PAGE_SIZE + 1}-${Math.min(
                  (txPage + 1) * PAGE_SIZE,
                  recentTransactions.length
                )} of ${recentTransactions.length}`
              : 'No records'}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTxPage((p) => Math.max(0, p - 1))}
              disabled={txPage === 0}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500 min-w-[3rem] text-center">
              {txPage + 1} / {totalTxPages}
            </span>
            <button
              onClick={() => setTxPage((p) => Math.min(totalTxPages - 1, p + 1))}
              disabled={txPage >= totalTxPages - 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 5. QUICK ACTIONS                                                    */}
      {/* ================================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <QuickActionCard
          icon={DollarSign}
          label="Record Donation"
          description="Log a new gift"
          href="/dashboard/donations"
        />
        <QuickActionCard
          icon={Receipt}
          label="Generate Receipt"
          description="Donor tax receipt"
          href="/dashboard/tax-documents"
        />
        <QuickActionCard
          icon={UserPlus}
          label="Add Beneficiary"
          description="New partner org"
          href="/dashboard/partner-churches"
        />
        <QuickActionCard
          icon={CalendarPlus}
          label="Schedule Event"
          description="Ministry calendar"
          href="/dashboard/events"
        />
        <QuickActionCard
          icon={Upload}
          label="Upload Document"
          description="Trust documents"
          href="/dashboard/documents"
        />
        <QuickActionCard
          icon={Shield}
          label="View Compliance"
          description="IRS factor status"
          href="/dashboard/compliance"
        />
      </div>

      {/* ================================================================== */}
      {/* 6. COMPLIANCE + AI TOOLS                                            */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* --- Compliance Status --- */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Compliance Status</h2>
            <span className="text-sm font-medium text-purple-600">
              {completedCount}/{complianceItems.length} Complete
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2.5 bg-gray-100 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full rounded-full bg-purple-500 transition-all duration-500"
              style={{ width: `${compliancePercent}%` }}
            />
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            {complianceItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  {item.status === 'complete' ? (
                    <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                  )}
                  <span
                    className={cn(
                      'text-sm',
                      item.status === 'complete' ? 'text-gray-900' : 'text-gray-600'
                    )}
                  >
                    {item.label}
                  </span>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                  {item.status === 'complete' ? item.date : `Due: ${item.dueDate}`}
                </span>
              </div>
            ))}
          </div>

          <a
            href="/dashboard/compliance"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
          >
            View all compliance items
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* --- AI-Powered Tools --- */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-50">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">AI-Powered Tools</h2>
          </div>

          <div className="space-y-4">
            {/* Activity Logger */}
            <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-100">
              <h3 className="text-sm font-medium text-gray-900 mb-1">Activity Logger</h3>
              <p className="text-xs text-gray-500 mb-3">
                Type a short note and let AI expand it into a full ministry activity record.
              </p>
              <input
                type="text"
                value={activityText}
                onChange={(e) => setActivityText(e.target.value)}
                placeholder="e.g. worship service 45 members, healing prayer session..."
                className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white placeholder:text-gray-400"
              />
              <div className="flex flex-wrap gap-2 mt-2.5">
                {ACTIVITY_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    className={cn(
                      'px-2.5 py-1 text-xs rounded-md border transition-colors',
                      selectedCategory === cat
                        ? 'bg-purple-500 text-white border-purple-500'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Meeting Recorder */}
            <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-100">
              <h3 className="text-sm font-medium text-gray-900 mb-1">Meeting Recorder</h3>
              <p className="text-xs text-gray-500 mb-3">
                Record elder board meetings or upload audio files (MP3, WAV, M4A). AI generates
                minutes and action items automatically.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="/dashboard/meeting-recorder"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                >
                  <Mic className="w-4 h-4" />
                  Start Recording
                </a>
                <button className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
                  Upload Audio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 7. ELDER BOARD / LEADERSHIP TEAM                                    */}
      {/* ================================================================== */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <ClipboardCheck className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Elder Board / Leadership Team</h2>
          </div>
          <a
            href="/dashboard/trustees"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Elder
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LEADERSHIP_TEAM.map((elder, i) => (
            <div
              key={i}
              className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold bg-purple-500 flex-shrink-0">
                  {elder.name === 'To Be Appointed'
                    ? '?'
                    : elder.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{elder.name}</p>
                  <p className="text-sm text-purple-600">{elder.role}</p>
                </div>
                <span
                  className={cn(
                    'px-2 py-1 text-xs font-medium rounded-full flex-shrink-0',
                    elder.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  )}
                >
                  {elder.status}
                </span>
              </div>

              {/* Bio */}
              <p className="mt-3 text-xs text-gray-500 leading-relaxed line-clamp-2">
                {elder.bio}
              </p>

              {/* Contact details */}
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{elder.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{elder.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>Joined {elder.joined}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stat Card Component
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  loading,
}: {
  icon: typeof DollarSign
  title: string
  value: string | null
  subtitle: string
  loading: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg bg-purple-50">
          <Icon className="w-5 h-5 text-purple-600" />
        </div>
        <span className="text-xs font-medium flex items-center gap-1 text-purple-600">
          <TrendingUp className="w-3 h-3" />
          Active
        </span>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 mt-1">
          <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
          <span className="text-sm text-gray-400">Loading...</span>
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Quick Action Card Component
// ---------------------------------------------------------------------------

function QuickActionCard({
  icon: Icon,
  label,
  description,
  href,
}: {
  icon: typeof Plus
  label: string
  description: string
  href: string
}) {
  return (
    <a
      href={href}
      className="bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-purple-300 hover:shadow-sm transition-all block group"
    >
      <div className="p-2 rounded-lg inline-block mb-3 bg-purple-50 group-hover:bg-purple-100 transition-colors">
        <Icon className="w-5 h-5 text-purple-600" />
      </div>
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </a>
  )
}

// ---------------------------------------------------------------------------
// Info Row Component
// ---------------------------------------------------------------------------

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  )
}
