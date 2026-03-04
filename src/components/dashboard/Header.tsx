'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { UserButton } from '@clerk/nextjs'
import { Bell, Search, Menu, ExternalLink, Crown, X, DollarSign, Users, Calendar, Shield, FileText, Activity } from 'lucide-react'
import { DashboardTheme } from '@/lib/themes'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: string
  description: string
  created_at: string
  metadata?: Record<string, unknown>
}

interface HeaderProps {
  theme: DashboardTheme
  onThemeChange: (theme: DashboardTheme) => void
  userName?: string
  userEmail?: string
  onMobileMenuToggle?: () => void
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function getNotificationIcon(type: string) {
  if (type.includes('donation')) return <DollarSign className="w-4 h-4 text-emerald-600" />
  if (type.includes('volunteer') || type.includes('member')) return <Users className="w-4 h-4 text-sky-600" />
  if (type.includes('event') || type.includes('schedule')) return <Calendar className="w-4 h-4 text-indigo-600" />
  if (type.includes('compliance')) return <Shield className="w-4 h-4 text-amber-600" />
  if (type.includes('document')) return <FileText className="w-4 h-4 text-purple-600" />
  return <Activity className="w-4 h-4 text-slate-500" />
}

export function Header({ theme, onThemeChange, userName, userEmail, onMobileMenuToggle }: HeaderProps) {
  const { user } = useUser()
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  const displayName = user?.firstName || user?.fullName || userName || 'Ministry Elder'
  const displayEmail = user?.primaryEmailAddress?.emailAddress || userEmail || ''

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/activity-logs?limit=20')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.logs || [])
      }
    } catch {
      // Silently fail - notifications are non-critical
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications()
    }
  }, [showNotifications, fetchNotifications])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotifications])

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
      {/* Left: Mobile Menu Button & Title */}
      <div className="flex items-center gap-4 lg:gap-6">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-600" />
            Sacred Revelation
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">508(c)(1)(A) Free Church Ministry Trust</p>
        </div>
      </div>

      {/* Right: Links, Search, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        <a
          href="https://www.startmybusiness.us/create-a-508-c1a-you-can-put-your-llc-or-corp-into"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors"
        >
          508 Services
          <ExternalLink className="w-3 h-3" />
        </a>

        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-40 md:w-56 pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all bg-slate-50 hover:bg-white"
          />
        </div>
        <button className="sm:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade-in">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center">
                    <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-400 mt-2">Loading...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No recent activity</p>
                    <p className="text-xs text-slate-400 mt-1">Actions you take will appear here</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100">
                        {getNotificationIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-800 leading-snug">{n.description}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{timeAgo(n.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 border-t border-slate-100 text-center">
                  <a href="/dashboard/ai-activity-log" className="text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors">
                    View all activity
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Account - Clerk UserButton */}
        <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">{displayName}</p>
            <p className="text-xs text-slate-500 truncate max-w-[160px]">{displayEmail}</p>
          </div>
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-9 h-9 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-colors',
              },
            }}
            afterSignOutUrl="/"
          />
        </div>
      </div>
    </header>
  )
}
