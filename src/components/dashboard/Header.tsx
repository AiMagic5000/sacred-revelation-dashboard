'use client'

import { Bell, Search, User, ChevronDown, Menu, ExternalLink, Crown } from 'lucide-react'
import { DashboardTheme, getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'

interface HeaderProps {
  theme: DashboardTheme
  onThemeChange: (theme: DashboardTheme) => void
  userName?: string
  userEmail?: string
  onMobileMenuToggle?: () => void
}

export function Header({ theme, onThemeChange, userName, userEmail, onMobileMenuToggle }: HeaderProps) {
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
            <Crown className="w-5 h-5 text-primary-600" />
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
          className="hidden md:flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-colors"
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
            className="w-40 md:w-56 pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all bg-slate-50 hover:bg-white"
          />
        </div>
        <button className="sm:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* User Menu */}
        <button className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{
            background: 'linear-gradient(135deg, #7C3AED, #4338CA)'
          }}>
            {userName ? userName.charAt(0).toUpperCase() : 'P'}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">
              {userName || 'Ministry Elder'}
            </p>
            <p className="text-xs text-slate-500">
              {userEmail || 'elder@sacredrevelation.org'}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </header>
  )
}
