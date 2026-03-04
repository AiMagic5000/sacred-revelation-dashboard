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
  const classes = getThemeClasses(theme)

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      {/* Left: Mobile Menu Button & Title */}
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Mobile Menu Button */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div>
          <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-700" />
            Sacred Revelation
          </h1>
          <p className="text-xs text-gray-500 hidden sm:block">508(c)(1)(A) Free Church Ministry Trust</p>
        </div>
      </div>

      {/* Right: Links, Search, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Links - Desktop */}
        <a
          href="https://www.startmybusiness.us/create-a-508-c1a-you-can-put-your-llc-or-corp-into"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-700 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
        >
          508 Services
          <ExternalLink className="w-3 h-3" />
        </a>

        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-40 md:w-64 pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-700 focus:ring-offset-0 focus:border-transparent transition-shadow"
          />
        </div>
        {/* Search icon only on mobile */}
        <button className="sm:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-700" />
        </button>

        {/* User Menu */}
        <button className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium bg-purple-700">
            {userName ? userName.charAt(0).toUpperCase() : 'P'}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              {userName || 'Ministry Elder'}
            </p>
            <p className="text-xs text-gray-500">
              {userEmail || 'elder@sacredrevelation.org'}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </header>
  )
}
