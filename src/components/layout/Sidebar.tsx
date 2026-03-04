'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Heart,
  Church,
  Users,
  Calendar,
  Sparkles,
  Mic,
  FileText,
  Download,
  Shield,
  Code2,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Crown,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Trust Data', href: '/dashboard/trust-data', icon: Building2 },
  { name: 'Ministry Services', href: '/dashboard/services', icon: BookOpen },
  { name: 'Donations', href: '/dashboard/donations', icon: Heart },
  { name: 'Partner Churches', href: '/dashboard/partner-churches', icon: Church },
  { name: 'Members', href: '/dashboard/members', icon: Users },
  { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { name: 'Activity Log', href: '/dashboard/activity-log', icon: Sparkles },
  { name: 'Meetings', href: '/dashboard/meetings', icon: Mic },
  { name: 'Documents', href: '/dashboard/documents', icon: FileText },
  { name: 'Tax Documents', href: '/dashboard/tax-documents', icon: Download },
  { name: 'Compliance', href: '/dashboard/compliance', icon: Shield },
  { name: '508 Software', href: '/dashboard/508-software', icon: Code2 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Help', href: '/dashboard/help', icon: HelpCircle },
]

interface SidebarProps {
  organizationName?: string
  organizationSubtitle?: string
  logoUrl?: string
}

export function Sidebar({
  organizationName = 'Sacred Revelation',
  organizationSubtitle = 'Free Church Ministry Trust',
}: SidebarProps) {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md hover:bg-light-100 transition-colors"
      >
        <Menu className="w-6 h-6 text-light-600" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-white border-r border-light-200 z-50 shadow-sm overflow-hidden transition-all duration-300',
          isExpanded ? 'w-64' : 'w-20',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-light-200 relative">
          <div className={cn(
            'flex items-center gap-3',
            isExpanded ? 'justify-start' : 'justify-center w-full'
          )}>
            <a
              href="https://www.startmybusiness.us/create-a-508-c1a-you-can-put-your-llc-or-corp-into"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 cursor-pointer bg-purple-50">
                <Crown className="w-6 h-6 text-purple-700" />
              </div>
            </a>
            {isExpanded && (
              <div className="flex flex-col">
                <h1 className="text-sm font-bold text-light-900">{organizationName}</h1>
                <p className="text-[10px] text-light-500">{organizationSubtitle}</p>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-light-100"
          >
            <X className="w-5 h-5 text-light-600" />
          </button>
        </div>

        {/* Expand Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'absolute top-20 left-1/2 -translate-x-1/2 p-2 rounded-lg bg-purple-50 border border-purple-200 transition-colors z-10',
            isExpanded ? 'opacity-100' : 'opacity-0'
          )}
        >
          <ChevronRight className={cn(
            'w-5 h-5 text-purple-700 transition-transform',
            isExpanded && 'rotate-180'
          )} />
        </button>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <div
                key={item.name}
                className="animate-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Link
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                    isActive
                      ? 'bg-purple-50 text-purple-700 font-medium'
                      : 'text-light-600 hover:bg-light-100 hover:text-light-900'
                  )}
                  title={!isExpanded ? item.name : undefined}
                >
                  <div className={cn(
                    'p-1 rounded-lg',
                    isActive ? 'bg-purple-100' : 'group-hover:bg-light-200'
                  )}>
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                  </div>
                  {isExpanded && (
                    <span className="text-sm whitespace-nowrap">{item.name}</span>
                  )}
                </Link>
              </div>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-light-200 bg-white">
          <div className={cn('flex', isExpanded ? 'justify-start' : 'justify-center')}>
            <Link
              href="/login"
              className="p-2 rounded-lg text-light-500 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}
