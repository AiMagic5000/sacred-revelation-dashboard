'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Send,
  Bot,
  MessageSquare,
  Loader2 as Spinner,
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
  Music,
  HeartHandshake,
  Leaf,
  Sun,
  MapPin,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Star,
  GraduationCap,
  FileText,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
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
    color: 'purple' as const,
  },
  {
    name: 'Michael C. Ward',
    role: 'Elder',
    email: 'michael@sacredrevelation.org',
    phone: '(916) 555-0102',
    joined: 'Aug 2025',
    status: 'Active',
    bio: 'Elder board member, multi-generational stewardship',
    color: 'emerald' as const,
  },
  {
    name: 'To Be Appointed',
    role: 'Elder / Board Member',
    email: '--',
    phone: '--',
    joined: '--',
    status: 'Pending',
    bio: 'Position open for qualified elder candidate',
    color: 'amber' as const,
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
  { month: 'Apr', value: 1200, donations: 8, beneficiaries: 3 },
  { month: 'May', value: 1850, donations: 12, beneficiaries: 5 },
  { month: 'Jun', value: 2400, donations: 15, beneficiaries: 7 },
  { month: 'Jul', value: 1950, donations: 11, beneficiaries: 4 },
  { month: 'Aug', value: 3200, donations: 18, beneficiaries: 9 },
  { month: 'Sep', value: 2800, donations: 16, beneficiaries: 8 },
  { month: 'Oct', value: 3600, donations: 22, beneficiaries: 11 },
  { month: 'Nov', value: 4100, donations: 25, beneficiaries: 14 },
  { month: 'Dec', value: 5200, donations: 32, beneficiaries: 18 },
  { month: 'Jan', value: 3800, donations: 20, beneficiaries: 12 },
  { month: 'Feb', value: 4500, donations: 28, beneficiaries: 15 },
  { month: 'Mar', value: 4900, donations: 30, beneficiaries: 17 },
]

const PROGRAM_DISTRIBUTION = [
  { name: 'Healing Ministry', value: 28, color: '#F43F5E' },
  { name: 'Music & Worship', value: 22, color: '#7C3AED' },
  { name: 'Life Coaching', value: 18, color: '#0EA5E9' },
  { name: 'Food Ministry', value: 15, color: '#10B981' },
  { name: 'Community Outreach', value: 12, color: '#F59E0B' },
  { name: 'Education', value: 5, color: '#6366F1' },
]

const QUICK_ACTIONS = [
  { icon: DollarSign, label: 'Record Donation', description: 'Log a new gift', href: '/dashboard/donations', color: 'emerald' as const },
  { icon: Receipt, label: 'Generate Receipt', description: 'Donor tax receipt', href: '/dashboard/tax-documents', color: 'amber' as const },
  { icon: UserPlus, label: 'Add Beneficiary', description: 'New partner org', href: '/dashboard/partner-churches', color: 'sky' as const },
  { icon: CalendarPlus, label: 'Schedule Event', description: 'Ministry calendar', href: '/dashboard/events', color: 'rose' as const },
  { icon: Upload, label: 'Upload Document', description: 'Trust documents', href: '/dashboard/documents', color: 'purple' as const },
  { icon: Shield, label: 'View Compliance', description: 'IRS factor status', href: '/dashboard/compliance', color: 'teal' as const },
] as const

const ICON_COLOR_MAP = {
  purple: { bg: 'bg-primary-100', text: 'text-primary-600', hover: 'hover:bg-primary-50', border: 'hover:border-primary-300' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', hover: 'hover:bg-emerald-50', border: 'hover:border-emerald-300' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600', hover: 'hover:bg-amber-50', border: 'hover:border-amber-300' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-600', hover: 'hover:bg-rose-50', border: 'hover:border-rose-300' },
  sky: { bg: 'bg-sky-100', text: 'text-sky-600', hover: 'hover:bg-sky-50', border: 'hover:border-sky-300' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-600', hover: 'hover:bg-teal-50', border: 'hover:border-teal-300' },
  gold: { bg: 'bg-amber-100', text: 'text-amber-700', hover: 'hover:bg-amber-50', border: 'hover:border-amber-300' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', hover: 'hover:bg-indigo-50', border: 'hover:border-indigo-300' },
} as const

// ---------------------------------------------------------------------------
// Dashboard Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area')
  const [txPage, setTxPage] = useState(0)
  const [activityText, setActivityText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: donations, isLoading: donationsLoading } = useDonations()
  const { data: partners } = usePartners()
  const { data: compliance } = useCompliance()
  const { data: volunteers } = useVolunteers()

  // Derived data
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

  const now = new Date()
  const greeting =
    now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening'

  return (
    <div className="space-y-6 pb-8">
      {/* ================================================================== */}
      {/* 1. WELCOME BANNER - Rich gradient with decorative elements         */}
      {/* ================================================================== */}
      <div className="animate-in rounded-2xl p-6 md:p-8 text-white relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #581C87 0%, #7C3AED 30%, #4338CA 60%, #312E81 100%)'
      }}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-amber-400/10 rounded-full" />

        {/* Gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-60" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
                <Sun className="w-6 h-6 text-amber-300" />
              </div>
              <span className="text-sm font-medium text-purple-200">{greeting}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Welcome to Sacred Revelation
            </h1>
            <p className="mt-1 text-purple-200 text-sm md:text-base">
              508(c)(1)(A) Free Church Ministry Trust &middot; Sacramento, California
            </p>
            <p className="mt-4 text-purple-100/80 italic text-sm max-w-xl leading-relaxed">
              {SCRIPTURE_VERSE}
            </p>
          </div>

          {/* Quick info cards */}
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-300" />
                <span className="text-sm font-medium text-white">Sacramento, CA</span>
              </div>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-300" />
                <span className="text-sm font-medium text-white">
                  {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 1.5. TRUST ASSISTANT - AI-powered ministry helper                  */}
      {/* ================================================================== */}
      <TrustAssistant />

      {/* ================================================================== */}
      {/* 2. STATS GRID - Multi-color gradient cards                         */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          title="Total Giving"
          value={statsLoading ? null : formatCurrency(totalGiving)}
          subtitle="year-to-date"
          loading={statsLoading}
          color="emerald"
          trend="+24%"
        />
        <StatCard
          icon={Church}
          title="Partner Organizations"
          value={statsLoading ? null : partnerCount.toString()}
          subtitle="churches & beneficiaries"
          loading={statsLoading}
          color="purple"
          trend="+3"
        />
        <StatCard
          icon={Users}
          title="Active Volunteers"
          value={statsLoading ? null : activeVolunteers.toString()}
          subtitle="serving this month"
          loading={statsLoading}
          color="sky"
          trend="+12"
        />
        <StatCard
          icon={Sparkles}
          title="Ministry Programs"
          value={statsLoading ? null : programCount.toString()}
          subtitle="active programs"
          loading={statsLoading}
          color="amber"
        />
      </div>

      {/* ================================================================== */}
      {/* 3. CHARTS ROW - Giving chart + Program distribution                */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- Ministry Giving Chart (2/3 width) --- */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-card animate-in-delay-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Ministry Giving Impact</h2>
              <p className="text-sm text-slate-500 mt-0.5">Monthly donation trends and growth</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChartType('area')}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  chartType === 'area'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                )}
                title="Area chart"
              >
                <Activity className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  chartType === 'bar'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                )}
                title="Bar chart"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Recharts */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={MONTHLY_GIVING} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGiving" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#7C3AED"
                    strokeWidth={2.5}
                    fill="url(#colorGiving)"
                  />
                </AreaChart>
              ) : (
                <BarChart data={MONTHLY_GIVING} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {MONTHLY_GIVING.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === MONTHLY_GIVING.length - 1 ? '#D4A84B' : '#7C3AED'}
                        fillOpacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Summary row */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">
                {formatCurrency(MONTHLY_GIVING.reduce((s, m) => s + m.value, 0))}
              </p>
              <p className="text-xs text-slate-500">Total Given</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">28</p>
              <p className="text-xs text-slate-500">Beneficiaries Served</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-600 flex items-center justify-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +24%
              </p>
              <p className="text-xs text-slate-500">Growth</p>
            </div>
          </div>
        </div>

        {/* --- Program Distribution Pie (1/3 width) --- */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card animate-in-delay-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-indigo-100">
              <PieChart className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Programs</h2>
              <p className="text-xs text-slate-500">Activity distribution</p>
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={PROGRAM_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {PROGRAM_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-2">
            {PROGRAM_DISTRIBUTION.map((prog) => (
              <div key={prog.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: prog.color }} />
                  <span className="text-xs text-slate-600">{prog.name}</span>
                </div>
                <span className="text-xs font-semibold text-slate-900">{prog.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 4. MINISTRY INFO + QUICK ACTIONS ROW                               */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* --- Ministry Information Card --- */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card animate-in-delay-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-primary-100">
              <BookOpen className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Ministry Information</h2>
              <p className="text-xs text-slate-500">508(c)(1)(A) trust details</p>
            </div>
          </div>

          <div className="space-y-3">
            <InfoRow label="Ministry Name" value={MINISTRY_INFO.name} />
            <InfoRow label="Formation Date" value={MINISTRY_INFO.formationDate} />
            <InfoRow label="EIN" value={MINISTRY_INFO.ein} />
            <InfoRow label="State" value={MINISTRY_INFO.state} />
            <InfoRow label="Structure" value={MINISTRY_INFO.structure} />
            <InfoRow label="Presiding Elder" value={MINISTRY_INFO.presidingElder} />
            <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
              <span className="text-sm text-slate-500">Status</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {MINISTRY_INFO.status}
              </span>
            </div>
          </div>

          <a
            href="/dashboard/trust-data"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            View full trust record
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* --- Quick Actions Grid --- */}
        <div className="animate-in-delay-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-amber-100">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
              <p className="text-xs text-slate-500">Common tasks at a glance</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <QuickActionCard
                key={action.label}
                icon={action.icon}
                label={action.label}
                description={action.description}
                href={action.href}
                color={action.color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 5. RECENT TRANSACTIONS TABLE                                       */}
      {/* ================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card animate-in-delay-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
              <p className="text-xs text-slate-500">{donations?.length || 0} total records</p>
            </div>
          </div>
          <a
            href="/dashboard/donations"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
          >
            View All
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Donor</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {donationsLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-500 mx-auto" />
                    <p className="text-sm text-slate-500 mt-2">Loading transactions...</p>
                  </td>
                </tr>
              ) : paginatedTx.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 rounded-2xl bg-primary-50">
                        <Heart className="w-8 h-8 text-primary-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-900">No transactions yet</p>
                      <p className="text-xs text-slate-500">Record your first donation to get started.</p>
                      <a
                        href="/dashboard/donations"
                        className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Record Donation
                      </a>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTx.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-slate-900">{tx.name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-medium px-2 py-1 rounded-md bg-slate-100 text-slate-600">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-500">{tx.date}</td>
                    <td className={cn(
                      'py-3 px-4 text-sm font-semibold text-right',
                      tx.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    )}>
                      {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        'px-2.5 py-1 text-xs font-semibold rounded-full',
                        tx.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      )}>
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
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            {recentTransactions.length > 0
              ? `Showing ${txPage * PAGE_SIZE + 1}-${Math.min((txPage + 1) * PAGE_SIZE, recentTransactions.length)} of ${recentTransactions.length}`
              : 'No records'}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTxPage((p) => Math.max(0, p - 1))}
              disabled={txPage === 0}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-500 min-w-[3rem] text-center">
              {txPage + 1} / {totalTxPages}
            </span>
            <button
              onClick={() => setTxPage((p) => Math.min(totalTxPages - 1, p + 1))}
              disabled={txPage >= totalTxPages - 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 6. MINISTRY PROGRAMS OVERVIEW                                      */}
      {/* ================================================================== */}
      <div className="animate-in-delay-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-rose-100">
            <Heart className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Ministry Programs</h2>
            <p className="text-xs text-slate-500">Love, hope, and healing through faith</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ProgramCard
            icon={HeartHandshake}
            title="Healing Ministry"
            description="Prayer, laying on of hands, anointing, natural health counseling, and sound healing sessions"
            href="/dashboard/healing-ministry"
            color="rose"
            stats="7 session types"
          />
          <ProgramCard
            icon={Music}
            title="Music & Worship"
            description="Worship services, concerts, praise nights, recording sessions, and sound healing events"
            href="/dashboard/music-worship"
            color="purple"
            stats="7 event types"
          />
          <ProgramCard
            icon={GraduationCap}
            title="Life Coaching"
            description="Training, counseling, prayer mentoring, and assessment sessions for spiritual growth"
            href="/dashboard/life-coaching"
            color="sky"
            stats="5 session types"
          />
          <ProgramCard
            icon={Leaf}
            title="Food Ministry"
            description="Aquaponics, vertical gardens, food forest, and community food distribution programs"
            href="/dashboard/1000lbs-of-food"
            color="emerald"
            stats="1,000 lbs goal"
          />
          <ProgramCard
            icon={Church}
            title="Community Outreach"
            description="Partner church support, beneficiary distributions, and volunteer coordination"
            href="/dashboard/partner-churches"
            color="amber"
            stats={`${partnerCount} partners`}
          />
          <ProgramCard
            icon={FileText}
            title="Elder Board"
            description="Resolution tracking, board meeting minutes, and governance documentation"
            href="/dashboard/elder-board"
            color="indigo"
            stats="Active governance"
          />
        </div>
      </div>

      {/* ================================================================== */}
      {/* 7. COMPLIANCE + AI TOOLS                                           */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* --- Compliance Status --- */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card animate-in-delay-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-teal-100">
                <Shield className="w-5 h-5 text-teal-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Compliance Status</h2>
            </div>
            <span className="text-sm font-semibold text-primary-600">
              {completedCount}/{complianceItems.length} Complete
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-slate-100 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${compliancePercent}%`,
                background: 'linear-gradient(90deg, #7C3AED, #A855F7)',
              }}
            />
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            {complianceItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  {item.status === 'complete' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
                  )}
                  <span className={cn('text-sm', item.status === 'complete' ? 'text-slate-900 font-medium' : 'text-slate-500')}>
                    {item.label}
                  </span>
                </div>
                <span className={cn(
                  'text-xs flex-shrink-0 ml-2 px-2 py-0.5 rounded-md',
                  item.status === 'complete' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                )}>
                  {item.status === 'complete' ? item.date : `Due: ${item.dueDate}`}
                </span>
              </div>
            ))}
          </div>

          <a
            href="/dashboard/compliance"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            View all compliance items
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* --- AI-Powered Tools --- */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card animate-in-delay-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-primary-100">
              <Sparkles className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">AI-Powered Tools</h2>
              <p className="text-xs text-slate-500">Smart ministry automation</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Activity Logger */}
            <div className="p-4 rounded-xl border border-primary-100 bg-gradient-to-br from-primary-50/50 to-indigo-50/30">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Activity Logger</h3>
              <p className="text-xs text-slate-500 mb-3">
                Type a short note and let AI expand it into a full ministry activity record.
              </p>
              <input
                type="text"
                value={activityText}
                onChange={(e) => setActivityText(e.target.value)}
                placeholder="e.g. worship service 45 members, healing prayer session..."
                className="w-full px-3 py-2.5 text-sm border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 bg-white placeholder:text-slate-400"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {ACTIVITY_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer',
                      selectedCategory === cat
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-600'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Meeting Recorder */}
            <div className="p-4 rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50/50 to-indigo-50/30">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Meeting Recorder</h3>
              <p className="text-xs text-slate-500 mb-3">
                Record elder board meetings or upload audio files. AI generates minutes and action items.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="/dashboard/meeting-recorder"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-sky-600 text-white hover:bg-sky-700 transition-colors shadow-sm cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  Start Recording
                </a>
                <button className="px-4 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 cursor-pointer">
                  Upload Audio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 8. ELDER BOARD / LEADERSHIP TEAM                                   */}
      {/* ================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card animate-in-delay-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100">
              <ClipboardCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Elder Board / Leadership Team</h2>
              <p className="text-xs text-slate-500">Governing body of the trust</p>
            </div>
          </div>
          <a
            href="/dashboard/trustees"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Elder
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {LEADERSHIP_TEAM.map((elder, i) => {
            const colors = ICON_COLOR_MAP[elder.color]
            return (
              <div
                key={i}
                className="relative p-5 border border-slate-200 rounded-2xl hover:shadow-card-hover transition-all hover:-translate-y-0.5"
              >
                {/* Color accent */}
                <div className={cn('absolute top-0 left-0 right-0 h-1 rounded-t-2xl', {
                  'bg-gradient-to-r from-primary-500 to-primary-700': elder.color === 'purple',
                  'bg-gradient-to-r from-emerald-500 to-emerald-700': elder.color === 'emerald',
                  'bg-gradient-to-r from-amber-500 to-amber-700': elder.color === 'amber',
                })} />

                {/* Header */}
                <div className="flex items-start gap-4 mt-1">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0',
                    {
                      'bg-gradient-to-br from-primary-500 to-primary-700': elder.color === 'purple',
                      'bg-gradient-to-br from-emerald-500 to-emerald-700': elder.color === 'emerald',
                      'bg-gradient-to-br from-amber-400 to-amber-600': elder.color === 'amber',
                    }
                  )}>
                    {elder.name === 'To Be Appointed'
                      ? '?'
                      : elder.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{elder.name}</p>
                    <p className={cn('text-sm', colors.text)}>{elder.role}</p>
                  </div>
                  <span className={cn(
                    'px-2.5 py-1 text-xs font-semibold rounded-full flex-shrink-0',
                    elder.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  )}>
                    {elder.status}
                  </span>
                </div>

                {/* Bio */}
                <p className="mt-3 text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {elder.bio}
                </p>

                {/* Contact details */}
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate text-xs">{elder.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-xs">{elder.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-xs">Joined {elder.joined}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Recharts Custom Tooltip
// ---------------------------------------------------------------------------

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg px-4 py-3">
      <p className="text-xs font-semibold text-slate-900">{label}</p>
      <p className="text-sm font-bold text-primary-600 mt-1">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stat Card Component - Multi-color
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  loading,
  color,
  trend,
}: {
  icon: typeof DollarSign
  title: string
  value: string | null
  subtitle: string
  loading: boolean
  color: keyof typeof ICON_COLOR_MAP
  trend?: string
}) {
  const colors = ICON_COLOR_MAP[color]
  return (
    <div className={cn('stat-card', `stat-card-${color}`)}>
      <div className="flex items-center justify-between mb-3">
        <div className={cn('p-2.5 rounded-xl', colors.bg)}>
          <Icon className={cn('w-5 h-5', colors.text)} />
        </div>
        {trend && (
          <span className="text-xs font-semibold flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      {loading ? (
        <div className="flex items-center gap-2 mt-1">
          <div className="h-7 w-24 rounded-lg shimmer" />
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Quick Action Card Component - Multi-color
// ---------------------------------------------------------------------------

function QuickActionCard({
  icon: Icon,
  label,
  description,
  href,
  color,
}: {
  icon: typeof Plus
  label: string
  description: string
  href: string
  color: keyof typeof ICON_COLOR_MAP
}) {
  const colors = ICON_COLOR_MAP[color]
  return (
    <a
      href={href}
      className={cn(
        'bg-white rounded-xl border border-slate-200 p-4 text-left transition-all block group hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
        colors.border
      )}
    >
      <div className={cn('p-2.5 rounded-xl inline-block mb-3 transition-colors', colors.bg, `group-${colors.hover}`)}>
        <Icon className={cn('w-5 h-5', colors.text)} />
      </div>
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
    </a>
  )
}

// ---------------------------------------------------------------------------
// Program Card Component
// ---------------------------------------------------------------------------

function ProgramCard({
  icon: Icon,
  title,
  description,
  href,
  color,
  stats,
}: {
  icon: typeof Heart
  title: string
  description: string
  href: string
  color: keyof typeof ICON_COLOR_MAP
  stats: string
}) {
  const colors = ICON_COLOR_MAP[color]
  return (
    <a
      href={href}
      className={cn(
        'bg-white rounded-2xl border border-slate-200 p-5 transition-all block group hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
        colors.border
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-3 rounded-xl', colors.bg)}>
          <Icon className={cn('w-6 h-6', colors.text)} />
        </div>
        <span className={cn('px-2.5 py-1 text-xs font-semibold rounded-full', colors.bg, colors.text)}>
          {stats}
        </span>
      </div>
      <h3 className="text-base font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
        {title}
      </h3>
      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
        {description}
      </p>
    </a>
  )
}

// ---------------------------------------------------------------------------
// Info Row Component
// ---------------------------------------------------------------------------

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Trust Assistant Component - AI-powered ministry helper
// ---------------------------------------------------------------------------

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED_ACTIONS = [
  { label: 'Record a donation', icon: DollarSign, color: 'emerald', prompt: 'Help me record a new donation' },
  { label: 'Check compliance', icon: Shield, color: 'teal', prompt: 'What is my current compliance status and what do I need to do?' },
  { label: 'Food ministry SOPs', icon: Leaf, color: 'emerald', prompt: 'Walk me through the daily food ministry SOPs' },
  { label: 'Schedule board meeting', icon: Calendar, color: 'indigo', prompt: 'Help me schedule an elder board meeting' },
  { label: 'Generate tax receipt', icon: Receipt, color: 'amber', prompt: 'How do I generate tax receipts for donors?' },
  { label: 'Add a volunteer', icon: UserPlus, color: 'sky', prompt: 'Help me add a new volunteer to the ministry' },
  { label: 'Trust overview', icon: BookOpen, color: 'purple', prompt: 'Give me an overview of our 508(c)(1)(A) trust status' },
  { label: 'Financial report', icon: BarChart3, color: 'rose', prompt: 'Help me generate a financial report for the ministry' },
] as const

function TrustAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: ChatMessage = { role: 'user', content: text.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)
    setIsExpanded(true)

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      })

      if (!res.ok) {
        throw new Error('Failed to get response')
      }

      const data = await res.json()
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response || 'I apologize, I was unable to process that. Please try again.',
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I encountered an error. Please try again or refresh the page.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleSuggestedAction = (prompt: string) => {
    sendMessage(prompt)
  }

  return (
    <div className="animate-in bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{
              background: 'linear-gradient(135deg, #7C3AED, #4338CA)'
            }}>
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Trust Assistant</h2>
              <p className="text-xs text-slate-500">What would you like to accomplish with your trust today?</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {isExpanded ? 'Minimize' : 'Expand'}
            </button>
          )}
        </div>
      </div>

      {/* Suggested Actions - show when no messages */}
      {messages.length === 0 && (
        <div className="p-5">
          <p className="text-sm text-slate-600 mb-3">Choose a task or type your own question:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {SUGGESTED_ACTIONS.map((action) => {
              const ActionIcon = action.icon
              const colors = ICON_COLOR_MAP[action.color]
              return (
                <button
                  key={action.label}
                  onClick={() => handleSuggestedAction(action.prompt)}
                  className={cn(
                    'flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 text-left hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer group',
                    colors.border
                  )}
                >
                  <div className={cn('p-1.5 rounded-lg flex-shrink-0', colors.bg)}>
                    <ActionIcon className={cn('w-4 h-4', colors.text)} />
                  </div>
                  <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 leading-tight">
                    {action.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      {messages.length > 0 && isExpanded && (
        <div className="max-h-96 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'assistant' && (
                <div className="p-1.5 rounded-lg bg-primary-100 h-fit flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-primary-600" />
                </div>
              )}
              <div className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-md'
                  : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-bl-md'
              )}>
                {msg.content.split('\n').map((line, j) => (
                  <p key={j} className={j > 0 ? 'mt-2' : ''}>
                    {line.split('**').map((segment, k) =>
                      k % 2 === 1 ? (
                        <strong key={k} className={msg.role === 'user' ? 'text-white' : 'text-slate-900'}>
                          {segment}
                        </strong>
                      ) : (
                        <span key={k}>{segment}</span>
                      )
                    )}
                  </p>
                ))}
              </div>
              {msg.role === 'user' && (
                <div className="p-1.5 rounded-lg bg-primary-100 h-fit flex-shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4 text-primary-600" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="p-1.5 rounded-lg bg-primary-100 h-fit flex-shrink-0">
                <Bot className="w-4 h-4 text-primary-600" />
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Spinner className="w-4 h-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Suggested actions when chat is active */}
      {messages.length > 0 && isExpanded && !isLoading && (
        <div className="px-5 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SUGGESTED_ACTIONS.slice(0, 4).map((action) => (
              <button
                key={action.label}
                onClick={() => handleSuggestedAction(action.prompt)}
                className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your trust..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 bg-white placeholder:text-slate-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2.5 rounded-xl text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:shadow-md"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #4338CA)' }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
