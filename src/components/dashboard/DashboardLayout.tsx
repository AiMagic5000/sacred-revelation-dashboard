'use client'

import { useState, useEffect } from 'react'
import { DashboardTheme } from '@/lib/themes'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { X } from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
  ministryName?: string
  logoUrl?: string
  defaultTheme?: DashboardTheme
  isDemo?: boolean
}

export function DashboardLayout({
  children,
  ministryName,
  logoUrl,
  defaultTheme = 'sacred',
  isDemo = true,
}: DashboardLayoutProps) {
  const [theme, setTheme] = useState<DashboardTheme>(defaultTheme)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Persist theme preference
  useEffect(() => {
    const saved = localStorage.getItem('dashboard-theme') as DashboardTheme
    if (saved && (saved === 'sacred' || saved === 'kingdom')) {
      setTheme(saved)
    }
  }, [])

  // Close mobile menu on route change or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const handleThemeChange = (newTheme: DashboardTheme) => {
    setTheme(newTheme)
    localStorage.setItem('dashboard-theme', newTheme)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar
          theme={theme}
          ministryName={ministryName}
          logoUrl={logoUrl}
        />
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-out menu */}
          <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl animate-slide-in">
            {/* Close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg z-10"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>

            <Sidebar
              theme={theme}
              ministryName={ministryName}
              logoUrl={logoUrl}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          theme={theme}
          onThemeChange={handleThemeChange}
          userName="Ministry Elder"
          userEmail="elder@sacredrevelation.org"
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
        />

        {/* Demo Banner */}
        {isDemo && (
          <div className="bg-purple-50 border-b border-purple-200 px-4 lg:px-6 py-2 text-center">
            <p className="text-sm text-purple-800">
              <strong>Demo Mode</strong> - Viewing sample data.{' '}
              <a href="/signup" className="underline font-medium hover:text-purple-900">
                Create your ministry account
              </a>{' '}
              to manage your own organization.
            </p>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
