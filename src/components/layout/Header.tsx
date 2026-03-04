'use client'

import { useState } from 'react'
import { UserButton } from '@clerk/nextjs'
import { Bell, Search, Plus, ChevronDown, Crown } from 'lucide-react'

interface HeaderProps {
  userName?: string
  userRole?: string
  userAvatar?: string
}

export function Header({
  userName = 'Ministry Elder',
  userRole = 'Presiding Elder',
}: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="h-16 bg-white border-b border-light-200 sticky top-0 z-40 shadow-sm">
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Search */}
        <div className="hidden md:block relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-400" />
          <input
            type="text"
            placeholder="Search trusts, donations, members..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-light-100 border border-light-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all outline-none text-sm"
          />
        </div>

        {/* Mobile Search Toggle */}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-light-100 transition-colors"
        >
          <Search className="w-5 h-5 text-light-600" />
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* External Links */}
          <a
            href="https://www.startmybusiness.us/create-a-508-c1a-you-can-put-your-llc-or-corp-into"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-block btn-primary text-sm px-4 py-2"
          >
            508 Services
          </a>

          {/* Add Donation */}
          <button className="hidden sm:flex btn-primary items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Add Donation</span>
          </button>
          <button className="sm:hidden p-2 rounded-lg bg-primary-800 text-white">
            <Plus className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button className="relative p-2 rounded-lg hover:bg-light-100 transition-colors">
              <Bell className="w-5 h-5 text-light-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-purple-700 rounded-full animate-pulse" />
            </button>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-light-200">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-light-900">{userName}</p>
              <p className="text-xs text-light-500">{userRole}</p>
            </div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-purple-200',
                },
              }}
            />
            <ChevronDown className="hidden md:block w-4 h-4 text-light-400" />
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-light-200 p-4 shadow-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-light-100 border border-light-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all outline-none text-sm"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  )
}
