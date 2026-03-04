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
} from 'lucide-react'
import { DashboardTheme } from '@/lib/themes'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  isNew?: boolean
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
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/trust-data', label: 'Trust Data', icon: Shield },
      { href: '/dashboard/donations', label: 'Donations & Giving', icon: DollarSign },
      { href: '/dashboard/financial-reports', label: 'Financial Reports', icon: BarChart3 },
      { href: '/dashboard/documents', label: 'Documents', icon: FileText },
      { href: '/dashboard/tax-documents', label: 'Tax Documents', icon: Receipt },
      { href: '/dashboard/compliance', label: 'Compliance', icon: ClipboardCheck },
      { href: '/dashboard/elder-board', label: 'Elder Board', icon: Users },
    ],
  },
  {
    id: 'outreach-community',
    label: 'OUTREACH & COMMUNITY',
    items: [
      { href: '/dashboard/partner-churches', label: 'Partner Churches', icon: Church },
      { href: '/dashboard/beneficiary-organizations', label: 'Beneficiary Organizations', icon: Heart },
      { href: '/dashboard/distribution', label: 'Distribution', icon: Truck },
      { href: '/dashboard/volunteers', label: 'Volunteers', icon: UserCheck },
      { href: '/dashboard/events', label: 'Schedule & Events', icon: Calendar },
      { href: '/dashboard/members', label: 'Members', icon: Building2 },
    ],
  },
  {
    id: 'ministry-programs',
    label: 'MINISTRY PROGRAMS',
    items: [
      { href: '/dashboard/healing-ministry', label: 'Healing Ministry', icon: Sparkles },
      { href: '/dashboard/music-worship', label: 'Music & Worship', icon: Music },
      { href: '/dashboard/life-coaching', label: 'Life Coaching', icon: GraduationCap },
      { href: '/dashboard/food-ministry', label: 'Food Ministry', icon: Wheat },
      { href: '/dashboard/ai-activity-log', label: 'AI Activity Log', icon: Activity, isNew: true },
      { href: '/dashboard/meeting-recorder', label: 'Meeting Recorder', icon: Mic, isNew: true },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      { href: '/dashboard/help', label: 'Help', icon: HelpCircle },
    ],
  },
]

function getSacredThemeStyles(theme: DashboardTheme) {
  if (theme === 'kingdom') {
    return {
      activeItem: 'bg-slate-100 text-slate-900',
      hoverItem: 'hover:bg-gray-100 hover:text-gray-900',
      activeIcon: 'text-slate-800',
      inactiveIcon: 'text-gray-400',
      sectionLabel: 'text-gray-400 uppercase text-[10px] tracking-widest font-semibold',
      newBadge: 'bg-slate-700 text-white',
      logoGradient: 'bg-gradient-to-br from-slate-700 to-blue-950',
      logoBg: 'bg-slate-50',
      subtitleText: 'text-slate-600',
    }
  }

  return {
    activeItem: 'bg-purple-50 text-purple-800',
    hoverItem: 'hover:bg-gray-100 hover:text-gray-900',
    activeIcon: 'text-purple-600',
    inactiveIcon: 'text-gray-400',
    sectionLabel: 'text-gray-400 uppercase text-[10px] tracking-widest font-semibold',
    newBadge: 'bg-purple-500 text-white',
    logoGradient: 'bg-gradient-to-br from-purple-600 to-purple-800',
    logoBg: 'bg-purple-50',
    subtitleText: 'text-purple-600',
  }
}

export function Sidebar({ theme, ministryName, logoUrl, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const styles = getSacredThemeStyles(theme)

  const orgName = ministryName || 'Sacred Revelation'
  const orgSubtitle = 'Free Church Ministry Trust'

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo / Ministry Identity */}
      <div className={cn('p-5 border-b border-gray-200', styles.logoBg)}>
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={orgName}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold shadow-sm',
                styles.logoGradient
              )}
            >
              <span role="img" aria-label="Sacred Revelation">&#10014;</span>
            </div>
          )}
          <div className="min-w-0">
            <h2 className="font-bold text-gray-900 text-sm leading-tight truncate">
              {orgName}
            </h2>
            <p className={cn('text-[11px] leading-tight mt-0.5', styles.subtitleText)}>
              {orgSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Sectioned Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        {sacredSections.map((section, sectionIdx) => (
          <div key={section.id}>
            {/* Section separator (between sections, not before first) */}
            {sectionIdx > 0 && (
              <div className="mx-4 my-2 border-t border-gray-200" />
            )}

            {/* Section header */}
            <div className="px-5 pt-3 pb-1.5">
              <span className={styles.sectionLabel}>
                {section.label}
              </span>
            </div>

            {/* Section nav items */}
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
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? styles.activeItem
                        : cn('text-gray-600', styles.hoverItem)
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-[18px] h-[18px] flex-shrink-0',
                        isActive ? styles.activeIcon : styles.inactiveIcon
                      )}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.isNew && (
                      <span
                        className={cn(
                          'px-1.5 py-0.5 text-[9px] font-bold rounded leading-none',
                          styles.newBadge
                        )}
                      >
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
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-[11px] text-gray-400 text-center leading-tight">
          Powered by Start My Business Inc.
        </p>
      </div>
    </aside>
  )
}
