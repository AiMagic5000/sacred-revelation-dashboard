'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Shield,
  DollarSign,
  BarChart3,
  FileText,
  Receipt,
  ClipboardCheck,
  Users,
  Church,
  Heart,
  Truck,
  UserCheck,
  Calendar,
  Building2,
  Sparkles,
  Music,
  GraduationCap,
  Wheat,
  Activity,
  Mic,
  Settings,
  HelpCircle,
  Leaf,
} from 'lucide-react'
import { DashboardTheme } from '@/lib/themes'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  isNew?: boolean
  color?: string
}

interface NavSection {
  id: string
  label: string
  items: NavItem[]
}

interface SidebarProps {
  theme: DashboardTheme
  ministryName?: string
  logoUrl?: string
  onNavigate?: () => void
}

const sacredSections: NavSection[] = [
  {
    id: 'ministry-management',
    label: 'MINISTRY MANAGEMENT',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'primary' },
      { href: '/dashboard/trust-data', label: 'Trust Data', icon: Shield, color: 'indigo' },
      { href: '/dashboard/donations', label: 'Donations & Giving', icon: DollarSign, color: 'emerald' },
      { href: '/dashboard/financial-reports', label: 'Financial Reports', icon: BarChart3, color: 'amber' },
      { href: '/dashboard/documents', label: 'Documents', icon: FileText, color: 'sky' },
      { href: '/dashboard/tax-documents', label: 'Tax Documents', icon: Receipt, color: 'teal' },
      { href: '/dashboard/compliance', label: 'Compliance', icon: ClipboardCheck, color: 'rose' },
      { href: '/dashboard/elder-board', label: 'Elder Board', icon: Users, color: 'indigo' },
    ],
  },
  {
    id: 'outreach-community',
    label: 'OUTREACH & COMMUNITY',
    items: [
      { href: '/dashboard/partner-churches', label: 'Partner Churches', icon: Church, color: 'amber' },
      { href: '/dashboard/beneficiary-organizations', label: 'Beneficiary Orgs', icon: Heart, color: 'rose' },
      { href: '/dashboard/distribution', label: 'Distribution', icon: Truck, color: 'emerald' },
      { href: '/dashboard/volunteers', label: 'Volunteers', icon: UserCheck, color: 'sky' },
      { href: '/dashboard/events', label: 'Schedule & Events', icon: Calendar, color: 'primary' },
      { href: '/dashboard/members', label: 'Members', icon: Building2, color: 'teal' },
    ],
  },
  {
    id: 'ministry-programs',
    label: 'MINISTRY PROGRAMS',
    items: [
      { href: '/dashboard/healing-ministry', label: 'Healing Ministry', icon: Sparkles, color: 'rose' },
      { href: '/dashboard/music-worship', label: 'Music & Worship', icon: Music, color: 'primary' },
      { href: '/dashboard/life-coaching', label: 'Life Coaching', icon: GraduationCap, color: 'sky' },
      { href: '/dashboard/food-ministry', label: 'Food Ministry', icon: Wheat, color: 'amber' },
      { href: '/dashboard/1000lbs-of-food', label: '1000 lbs of Food', icon: Leaf, color: 'emerald' },
      { href: '/dashboard/ai-activity-log', label: 'AI Activity Log', icon: Activity, isNew: true, color: 'indigo' },
      { href: '/dashboard/meeting-recorder', label: 'Meeting Recorder', icon: Mic, isNew: true, color: 'teal' },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      { href: '/dashboard/help', label: 'Help', icon: HelpCircle },
    ],
  },
]

export function Sidebar({ theme, ministryName, logoUrl, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const orgName = ministryName || 'Sacred Revelation'
  const orgSubtitle = 'Free Church Ministry Trust'

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col">
      {/* Logo / Ministry Identity */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={orgName} className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm" style={{
              background: 'linear-gradient(135deg, #7C3AED, #4338CA)'
            }}>
              <span role="img" aria-label="Sacred Revelation">&#10014;</span>
            </div>
          )}
          <div className="min-w-0">
            <h2 className="font-bold text-slate-900 text-sm leading-tight truncate">
              {orgName}
            </h2>
            <p className="text-[11px] leading-tight mt-0.5 text-primary-600 font-medium">
              {orgSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Sectioned Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        {sacredSections.map((section, sectionIdx) => (
          <div key={section.id}>
            {sectionIdx > 0 && (
              <div className="mx-4 my-2 border-t border-slate-100" />
            )}
            <div className="px-5 pt-3 pb-1.5">
              <span className="text-slate-400 uppercase text-[10px] tracking-widest font-semibold">
                {section.label}
              </span>
            </div>
            <div className="px-3 space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary-50 text-primary-800 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-[18px] h-[18px] flex-shrink-0',
                        isActive ? 'text-primary-600' : 'text-slate-400'
                      )}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.isNew && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md leading-none bg-primary-600 text-white">
                        NEW
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <p className="text-[11px] text-slate-400 text-center leading-tight">
          Powered by Start My Business Inc.
        </p>
      </div>
    </aside>
  )
}
