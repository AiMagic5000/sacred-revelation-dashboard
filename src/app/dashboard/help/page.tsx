'use client'

import { useState } from 'react'
import {
  GraduationCap,
  BookOpen,
  PlayCircle,
  ChevronRight,
  ChevronDown,
  Search,
  LayoutDashboard,
  Shield,
  DollarSign,
  FileText,
  Users,
  Heart,
  Wheat,
  Leaf,
  Calendar,
  Church,
  Music,
  Sparkles,
  Activity,
  Mic,
  Settings,
  CheckCircle2,
  Lightbulb,
  MessageCircle,
  Mail,
  Star,
  Zap,
  ArrowRight,
  Clock,
  Target,
  TrendingUp,
  ShieldCheck,
  Video,
} from 'lucide-react'

/* ────────────────────────────────────────────────────────── */
/*  TYPES                                                     */
/* ────────────────────────────────────────────────────────── */

type GuideCategory = 'getting-started' | 'ministry' | 'finance' | 'programs' | 'advanced'

interface Step {
  title: string
  description: string
}

interface Guide {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  category: GuideCategory
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  steps: Step[]
}

interface FAQ {
  question: string
  answer: string
  category: string
}

/* ────────────────────────────────────────────────────────── */
/*  DATA                                                      */
/* ────────────────────────────────────────────────────────── */

const GUIDE_CATEGORIES: { id: GuideCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'getting-started', label: 'Getting Started', icon: Zap },
  { id: 'ministry', label: 'Ministry Ops', icon: Church },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'programs', label: 'Programs', icon: Heart },
  { id: 'advanced', label: 'Advanced', icon: Settings },
]

const GUIDES: Guide[] = [
  {
    id: 'dashboard-overview',
    title: 'Dashboard Overview',
    description: 'Learn how to navigate the main dashboard and understand your ministry at a glance.',
    icon: LayoutDashboard,
    color: 'purple',
    category: 'getting-started',
    duration: '5 min',
    difficulty: 'Beginner',
    steps: [
      { title: 'Welcome Banner', description: 'The top banner shows your personalized greeting, location, and current date. Use the quick action buttons to jump to common tasks.' },
      { title: 'Stat Cards', description: 'Four colorful cards display your key metrics: total donations, active members, ministry programs, and compliance status. Each shows trends compared to last month.' },
      { title: 'Giving Trends Chart', description: 'Toggle between Area and Bar views to see monthly giving patterns. Hover over data points for detailed breakdowns of donations and beneficiary counts.' },
      { title: 'Program Distribution', description: 'The pie chart shows how your ministry resources are distributed across programs like healing, food outreach, worship, and community services.' },
      { title: 'Quick Actions', description: 'Color-coded action cards let you record donations, add members, submit compliance documents, or generate reports with a single click.' },
    ],
  },
  {
    id: 'trust-data',
    title: 'Managing Trust Data',
    description: 'Understand your 508(c)(1)(A) trust structure, trustees, and organizational details.',
    icon: Shield,
    color: 'indigo',
    category: 'ministry',
    duration: '8 min',
    difficulty: 'Beginner',
    steps: [
      { title: 'Trust Information', description: 'View and update your trust name, EIN, formation date, and registered agent details. All information is securely stored and encrypted.' },
      { title: 'Trustee Management', description: 'Add, edit, or remove trustees. Each trustee has a role (Grantor, Trustee, Beneficiary) and contact information. Minimum of 3 trustees required.' },
      { title: 'Trust Documents', description: 'Access your trust indenture, articles of organization, bylaws, and other formation documents. Download or share them securely.' },
      { title: 'Annual Review', description: 'Set annual review reminders to ensure your trust remains compliant and all trustee information is current.' },
    ],
  },
  {
    id: 'donations',
    title: 'Tracking Donations & Giving',
    description: 'Record tithes, offerings, and donations with full tracking and receipt generation.',
    icon: DollarSign,
    color: 'emerald',
    category: 'finance',
    duration: '6 min',
    difficulty: 'Beginner',
    steps: [
      { title: 'Record a Donation', description: 'Click "Record Donation" to enter donor name, amount, date, and giving category (tithe, offering, special gift, building fund). Receipts generate automatically.' },
      { title: 'Recurring Giving', description: 'Set up recurring donation schedules for members who give regularly. The system tracks expected vs actual giving for each member.' },
      { title: 'Tax Receipts', description: 'Generate end-of-year donation statements for your members. 508(c)(1)(A) donations are tax-deductible -- receipts include your EIN and trust name.' },
      { title: 'Giving Categories', description: 'Organize donations by category: General Fund, Building Fund, Missions, Benevolence, and custom categories you create for your ministry.' },
    ],
  },
  {
    id: 'financial-reports',
    title: 'Financial Reports',
    description: 'Generate income statements, balance sheets, and giving summaries for your ministry.',
    icon: TrendingUp,
    color: 'amber',
    category: 'finance',
    duration: '7 min',
    difficulty: 'Intermediate',
    steps: [
      { title: 'Income & Expense Reports', description: 'View monthly and annual summaries of all income (donations, events) and expenses (programs, operations, missions). Filter by date range or category.' },
      { title: 'Giving Summary', description: 'See total giving by member, by category, or by month. Identify giving trends and plan your ministry budget accordingly.' },
      { title: 'Export Reports', description: 'Export any report as PDF or CSV for your records. Share with your elder board or financial advisors.' },
      { title: 'Budget Tracking', description: 'Set budgets for each ministry area and track actual spending against planned amounts. Receive alerts when spending approaches budget limits.' },
    ],
  },
  {
    id: 'compliance',
    title: '508(c)(1)(A) Compliance',
    description: 'Stay compliant with IRS requirements for free church ministry trusts.',
    icon: ShieldCheck,
    color: 'rose',
    category: 'ministry',
    duration: '10 min',
    difficulty: 'Intermediate',
    steps: [
      { title: 'Compliance Dashboard', description: 'View your overall compliance score. Green indicators mean you are fully compliant; yellow means attention needed; red requires immediate action.' },
      { title: 'Required Documents', description: 'Ensure all required documents are on file: trust indenture, articles, bylaws, meeting minutes, and financial records. The checklist shows what is complete.' },
      { title: 'Meeting Minutes', description: 'Record elder board meeting minutes directly in the dashboard. Minutes are automatically dated and stored as part of your compliance records.' },
      { title: 'Annual Checklist', description: 'Complete your annual compliance checklist: board meetings held, financial records updated, trust documents reviewed, and beneficiary reports filed.' },
    ],
  },
  {
    id: 'food-ministry',
    title: 'Food Ministry Operations',
    description: 'Manage the 1000 lbs of Food initiative with aquaponics, vertical gardens, and food forest.',
    icon: Wheat,
    color: 'amber',
    category: 'programs',
    duration: '12 min',
    difficulty: 'Intermediate',
    steps: [
      { title: 'Production Overview', description: 'The Overview tab shows your total food production, active growing systems, and monthly distribution numbers across all three food production systems.' },
      { title: 'Aquaponics System', description: 'Monitor fish health, water quality (pH, ammonia, nitrates, temperature), feeding schedules, and tank maintenance from the Fish tab.' },
      { title: 'Vertical Tower Gardens', description: 'Track your 10 vertical towers, plant schedules, nutrient solution levels, and harvest timelines. Each tower produces 30-50 lbs of greens per cycle.' },
      { title: 'Food Forest Management', description: 'Manage your permaculture food forest with canopy trees, shrub layer, and ground cover plantings. Track seasonal harvests and maintenance tasks.' },
      { title: 'Daily SOPs', description: 'Follow the Standard Operating Procedures checklist each day. Color-coded by category: water quality, feeding, harvesting, maintenance, and distribution.' },
    ],
  },
  {
    id: '1000lbs-food',
    title: '1000 lbs of Food Goal',
    description: 'Track progress toward the monthly goal of growing and distributing 1000 lbs of food.',
    icon: Leaf,
    color: 'emerald',
    category: 'programs',
    duration: '8 min',
    difficulty: 'Beginner',
    steps: [
      { title: 'Interactive Tabs', description: 'Switch between Overview, Fish, Towers, Forest, and SOPs tabs to manage each food production system independently.' },
      { title: 'Production Stats', description: 'Track monthly production in lbs, families served, active systems, and volunteer hours. Stats update automatically from harvest logs.' },
      { title: 'Space Allocation', description: 'View how your growing space is divided: fish tanks, vertical towers, food forest, and community plots. Progress bars show utilization.' },
      { title: 'Distribution Tracking', description: 'Log food distribution to families, partner churches, and community organizations. Generate monthly reports for your records.' },
    ],
  },
  {
    id: 'healing-ministry',
    title: 'Healing Ministry',
    description: 'Schedule prayer sessions, track testimonies, and manage healing service events.',
    icon: Sparkles,
    color: 'rose',
    category: 'programs',
    duration: '6 min',
    difficulty: 'Beginner',
    steps: [
      { title: 'Prayer Requests', description: 'Receive and manage prayer requests from members and the community. Track each request through prayer, follow-up, and testimony stages.' },
      { title: 'Healing Services', description: 'Schedule regular healing services with date, time, location, and ministry team assignments. Send reminders to participants.' },
      { title: 'Testimonies', description: 'Record healing testimonies from members. Testimonies build faith and demonstrate the impact of your ministry to the community.' },
    ],
  },
  {
    id: 'elder-board',
    title: 'Elder Board Management',
    description: 'Manage board members, meetings, votes, and governance documents.',
    icon: Users,
    color: 'indigo',
    category: 'advanced',
    duration: '8 min',
    difficulty: 'Advanced',
    steps: [
      { title: 'Board Members', description: 'View all elder board members with their roles, terms, and contact information. Add new members or update existing records.' },
      { title: 'Meeting Scheduling', description: 'Schedule board meetings with agenda items. Send invitations with video conference links for remote members.' },
      { title: 'Voting & Resolutions', description: 'Create formal resolutions and conduct votes. Track quorum, yeas, nays, and abstentions. Generate official resolution documents.' },
      { title: 'Governance Documents', description: 'Store and manage bylaws, policies, and governance framework documents. Version control keeps track of all amendments.' },
    ],
  },
  {
    id: 'ai-tools',
    title: 'AI-Powered Tools',
    description: 'Use AI features for activity logging, meeting transcription, and smart insights.',
    icon: Activity,
    color: 'teal',
    category: 'advanced',
    duration: '10 min',
    difficulty: 'Advanced',
    steps: [
      { title: 'AI Activity Log', description: 'The AI monitors ministry activities and generates summaries. View automated insights about giving trends, member engagement, and program performance.' },
      { title: 'Meeting Recorder', description: 'Record elder board and ministry meetings. AI transcribes the audio and generates structured minutes with action items and decisions.' },
      { title: 'Smart Notifications', description: 'AI analyzes your ministry data and sends smart alerts about compliance deadlines, unusual giving patterns, and volunteer availability.' },
    ],
  },
]

const FAQ_ITEMS: FAQ[] = [
  {
    question: 'What is a 508(c)(1)(A) organization?',
    answer: 'A 508(c)(1)(A) organization is a mandatory exception religious organization that is automatically tax-exempt without applying for 501(c)(3) status from the IRS. It provides greater religious liberty and fewer reporting requirements while still allowing tax-deductible donations.',
    category: 'Compliance',
  },
  {
    question: 'Do I need to file Form 990?',
    answer: 'No. 508(c)(1)(A) organizations are exempt from filing Form 990 or any annual information returns with the IRS. However, maintaining accurate financial records is still important for internal governance and transparency.',
    category: 'Compliance',
  },
  {
    question: 'How do I add a new member?',
    answer: 'Go to the Members page from the sidebar, click "Add Member," and fill in their name, contact information, and role. You can also import members in bulk using a CSV file.',
    category: 'Getting Started',
  },
  {
    question: 'Can donors deduct their contributions?',
    answer: 'Yes. Donations to 508(c)(1)(A) organizations are tax-deductible for donors under IRC Section 170. The dashboard automatically generates donation receipts with your trust name and EIN for your donors.',
    category: 'Finance',
  },
  {
    question: 'How do I generate financial reports?',
    answer: 'Navigate to Financial Reports in the sidebar. Select a date range and report type (income summary, expense breakdown, or giving statement). Click Generate and the report will be created as a downloadable PDF.',
    category: 'Finance',
  },
  {
    question: 'What is the 1000 lbs of Food program?',
    answer: 'The 1000 lbs of Food program is a ministry initiative to grow and distribute 1,000 lbs of fresh food monthly through aquaponics, vertical tower gardens, and a permaculture food forest. Track production and distribution from the dedicated dashboard page.',
    category: 'Programs',
  },
  {
    question: 'How does the AI Meeting Recorder work?',
    answer: 'The Meeting Recorder captures audio from your elder board or ministry meetings, transcribes it using AI, and generates structured minutes with timestamps, action items, and decisions. Recordings are stored securely in your dashboard.',
    category: 'Advanced',
  },
  {
    question: 'How do I update my trust information?',
    answer: 'Go to Trust Data in the sidebar. Click "Edit" next to any field to update your trust name, EIN, registered agent, or trustee information. Changes are logged for compliance records.',
    category: 'Getting Started',
  },
]

const TIPS = [
  { icon: Target, title: 'Set Monthly Goals', description: 'Use the dashboard to set and track goals for donations, volunteer hours, and food production each month.', color: 'purple' },
  { icon: Clock, title: 'Check Daily SOPs', description: 'Review the Food Ministry SOPs tab daily. Consistent water checks and feeding schedules keep your aquaponics healthy.', color: 'emerald' },
  { icon: Star, title: 'Log Everything', description: 'Record all donations, meetings, and ministry activities. Thorough records protect your 508(c)(1)(A) status.', color: 'amber' },
  { icon: Lightbulb, title: 'Use Quick Actions', description: 'The Quick Actions section on the dashboard saves clicks. Record donations, add members, or generate reports fast.', color: 'sky' },
]

const COLOR_MAP: Record<string, { bg: string; text: string; iconBg: string; border: string; badge: string }> = {
  purple:  { bg: 'bg-purple-50',  text: 'text-purple-700',  iconBg: 'bg-purple-100',  border: 'border-purple-200',  badge: 'bg-purple-100 text-purple-700' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-100', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-700',   iconBg: 'bg-amber-100',   border: 'border-amber-200',   badge: 'bg-amber-100 text-amber-700' },
  rose:    { bg: 'bg-rose-50',     text: 'text-rose-700',     iconBg: 'bg-rose-100',     border: 'border-rose-200',     badge: 'bg-rose-100 text-rose-700' },
  sky:     { bg: 'bg-sky-50',      text: 'text-sky-700',      iconBg: 'bg-sky-100',      border: 'border-sky-200',      badge: 'bg-sky-100 text-sky-700' },
  indigo:  { bg: 'bg-indigo-50',   text: 'text-indigo-700',   iconBg: 'bg-indigo-100',   border: 'border-indigo-200',   badge: 'bg-indigo-100 text-indigo-700' },
  teal:    { bg: 'bg-teal-50',     text: 'text-teal-700',     iconBg: 'bg-teal-100',     border: 'border-teal-200',     badge: 'bg-teal-100 text-teal-700' },
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'bg-emerald-100 text-emerald-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-rose-100 text-rose-700',
}

/* ────────────────────────────────────────────────────────── */
/*  COMPONENTS                                                */
/* ────────────────────────────────────────────────────────── */

function GuideCard({ guide, onSelect }: { guide: Guide; onSelect: (id: string) => void }) {
  const Icon = guide.icon
  const colors = COLOR_MAP[guide.color] || COLOR_MAP.purple

  return (
    <button
      onClick={() => onSelect(guide.id)}
      className={`w-full text-left bg-white rounded-2xl border ${colors.border} p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${colors.iconBg} group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-slate-700">{guide.title}</h3>
          <p className="text-sm text-slate-500 line-clamp-2">{guide.description}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${DIFFICULTY_COLORS[guide.difficulty]}`}>
              {guide.difficulty}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              {guide.duration}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <BookOpen className="w-3 h-3" />
              {guide.steps.length} steps
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 mt-1 flex-shrink-0 transition-colors" />
      </div>
    </button>
  )
}

function GuideDetail({ guide, onBack }: { guide: Guide; onBack: () => void }) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const Icon = guide.icon
  const colors = COLOR_MAP[guide.color] || COLOR_MAP.purple

  const toggleStep = (idx: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev)
      if (next.has(idx)) {
        next.delete(idx)
      } else {
        next.add(idx)
      }
      return next
    })
  }

  const progress = guide.steps.length > 0 ? Math.round((completedSteps.size / guide.steps.length) * 100) : 0

  return (
    <div className="animate-in">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 cursor-pointer transition-colors"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        Back to guides
      </button>

      <div className={`rounded-2xl border ${colors.border} overflow-hidden`}>
        {/* Guide Header */}
        <div className={`${colors.bg} p-6`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${colors.iconBg}`}>
              <Icon className={`w-8 h-8 ${colors.text}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{guide.title}</h2>
              <p className="text-sm text-slate-600 mt-0.5">{guide.description}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${DIFFICULTY_COLORS[guide.difficulty]}`}>
                  {guide.difficulty}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {guide.duration}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>{completedSteps.size} of {guide.steps.length} steps completed</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-white/80 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progress === 100 ? 'bg-emerald-500' : 'bg-primary-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white divide-y divide-slate-100">
          {guide.steps.map((step, idx) => {
            const done = completedSteps.has(idx)
            return (
              <button
                key={idx}
                onClick={() => toggleStep(idx)}
                className={`w-full flex items-start gap-4 p-5 text-left hover:bg-slate-50/50 transition-colors cursor-pointer ${
                  done ? 'bg-emerald-50/30' : ''
                }`}
              >
                <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  done
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {done ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">{idx + 1}</span>
                  )}
                </div>
                <div>
                  <h4 className={`font-semibold text-sm ${done ? 'text-emerald-700 line-through' : 'text-slate-900'}`}>
                    {step.title}
                  </h4>
                  <p className={`text-sm mt-0.5 ${done ? 'text-slate-400' : 'text-slate-500'}`}>
                    {step.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Completion */}
        {progress === 100 && (
          <div className="bg-emerald-50 p-5 border-t border-emerald-100 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-emerald-800">Guide Complete!</p>
            <p className="text-sm text-emerald-600">You have completed all steps in this guide.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function FAQAccordion({ items }: { items: FAQ[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <div className="divide-y divide-slate-100">
      {items.map((faq, i) => (
        <button
          key={i}
          onClick={() => setOpenIdx(openIdx === i ? null : i)}
          className="w-full text-left p-5 hover:bg-slate-50/50 transition-colors cursor-pointer"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500 uppercase tracking-wider">
                  {faq.category}
                </span>
              </div>
              <h4 className="font-semibold text-slate-900 text-sm">{faq.question}</h4>
              {openIdx === i && (
                <p className="text-sm text-slate-600 mt-2 leading-relaxed animate-in">
                  {faq.answer}
                </p>
              )}
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${openIdx === i ? 'rotate-180' : ''}`} />
          </div>
        </button>
      ))}
    </div>
  )
}

/* ────────────────────────────────────────────────────────── */
/*  MAIN PAGE                                                 */
/* ────────────────────────────────────────────────────────── */

export default function HelpTrainingPage() {
  const [activeCategory, setActiveCategory] = useState<GuideCategory>('getting-started')
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredGuides = GUIDES.filter(g => {
    const matchesCategory = g.category === activeCategory
    const matchesSearch = searchQuery === ''
      || g.title.toLowerCase().includes(searchQuery.toLowerCase())
      || g.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const guide = selectedGuide ? GUIDES.find(g => g.id === selectedGuide) : null

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="animate-in">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 rounded-xl bg-purple-100">
            <GraduationCap className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Training & How-To Guides</h1>
            <p className="text-sm text-slate-500">Learn how to use every feature of your Sacred Revelation dashboard</p>
          </div>
        </div>
      </div>

      {/* Quick Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-in">
        {[
          { label: 'Total Guides', value: GUIDES.length.toString(), icon: BookOpen, color: 'text-purple-600 bg-purple-100' },
          { label: 'Video Tutorials', value: '12', icon: PlayCircle, color: 'text-sky-600 bg-sky-100' },
          { label: 'FAQ Answers', value: FAQ_ITEMS.length.toString(), icon: MessageCircle, color: 'text-amber-600 bg-amber-100' },
          { label: 'Pro Tips', value: TIPS.length.toString(), icon: Lightbulb, color: 'text-emerald-600 bg-emerald-100' },
        ].map((stat, i) => {
          const StatIcon = stat.icon
          return (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <StatIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm animate-in">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search guides, topics, and FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all bg-slate-50 hover:bg-white text-sm"
          />
        </div>
      </div>

      {/* Category Tabs */}
      {!selectedGuide && (
        <div className="flex gap-2 overflow-x-auto pb-1 animate-in">
          {GUIDE_CATEGORIES.map((cat) => {
            const CatIcon = cat.icon
            const isActive = cat.id === activeCategory
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CatIcon className={`w-4 h-4 ${isActive ? 'text-white/90' : 'text-slate-400'}`} />
                {cat.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Guide Content */}
      {guide ? (
        <GuideDetail guide={guide} onBack={() => setSelectedGuide(null)} />
      ) : (
        <div className="space-y-3 animate-in">
          {filteredGuides.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No guides found</p>
              <p className="text-sm text-slate-400 mt-1">Try a different search or category</p>
            </div>
          ) : (
            filteredGuides.map((g) => (
              <GuideCard key={g.id} guide={g} onSelect={setSelectedGuide} />
            ))
          )}
        </div>
      )}

      {/* Pro Tips Section */}
      {!selectedGuide && (
        <div className="animate-in">
          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Pro Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TIPS.map((tip, i) => {
              const TipIcon = tip.icon
              const colors = COLOR_MAP[tip.color] || COLOR_MAP.purple
              return (
                <div key={i} className={`bg-white rounded-xl border ${colors.border} p-4 flex items-start gap-3`}>
                  <div className={`p-2 rounded-lg ${colors.iconBg} flex-shrink-0`}>
                    <TipIcon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{tip.title}</h4>
                    <p className="text-sm text-slate-500 mt-0.5">{tip.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      {!selectedGuide && (
        <div className="animate-in">
          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-sky-500" />
            Frequently Asked Questions
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <FAQAccordion items={FAQ_ITEMS} />
          </div>
        </div>
      )}

      {/* Video Tutorials Section */}
      {!selectedGuide && (
        <div className="animate-in">
          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-rose-500" />
            Video Tutorials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { title: 'Getting Started Tour', duration: '4:30', color: 'purple', icon: LayoutDashboard },
              { title: 'Recording Donations', duration: '3:15', color: 'emerald', icon: DollarSign },
              { title: 'Food Ministry Setup', duration: '6:45', color: 'amber', icon: Wheat },
              { title: 'Compliance Checklist', duration: '5:20', color: 'rose', icon: ShieldCheck },
              { title: 'Elder Board Meetings', duration: '4:00', color: 'indigo', icon: Users },
              { title: 'AI Tools Overview', duration: '3:50', color: 'teal', icon: Activity },
            ].map((vid, i) => {
              const VidIcon = vid.icon
              const colors = COLOR_MAP[vid.color] || COLOR_MAP.purple
              return (
                <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                  <div className={`${colors.bg} p-8 flex items-center justify-center relative`}>
                    <VidIcon className={`w-10 h-10 ${colors.text} opacity-20`} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <PlayCircle className={`w-7 h-7 ${colors.text}`} />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-slate-900 text-sm">{vid.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {vid.duration}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Contact Support */}
      {!selectedGuide && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-in">
          <div className="bg-white rounded-xl border border-purple-200 p-5 text-center hover:shadow-md transition-shadow">
            <div className="inline-flex p-3 rounded-xl bg-purple-100 mb-3">
              <MessageCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1 text-sm">Live Chat</h3>
            <p className="text-xs text-slate-500 mb-3">Chat with support in real-time</p>
            <button className="w-full py-2 px-4 rounded-xl text-white text-sm font-medium bg-primary-600 hover:bg-primary-700 transition-colors cursor-pointer">
              Start Chat
            </button>
          </div>

          <div className="bg-white rounded-xl border border-sky-200 p-5 text-center hover:shadow-md transition-shadow">
            <div className="inline-flex p-3 rounded-xl bg-sky-100 mb-3">
              <Mail className="w-6 h-6 text-sky-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1 text-sm">Email Support</h3>
            <p className="text-xs text-slate-500 mb-3">Get help within 24 hours</p>
            <a
              href="mailto:support@508ministry.com"
              className="block w-full py-2 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Send Email
            </a>
          </div>

          <div className="bg-white rounded-xl border border-emerald-200 p-5 text-center hover:shadow-md transition-shadow">
            <div className="inline-flex p-3 rounded-xl bg-emerald-100 mb-3">
              <Video className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1 text-sm">Schedule a Call</h3>
            <p className="text-xs text-slate-500 mb-3">Book a walkthrough session</p>
            <button className="w-full py-2 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
              Book Now
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
