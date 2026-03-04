'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard'
import { DashboardTheme } from '@/lib/themes'

/**
 * Dashboard Layout - Sacred Revelation
 *
 * This is the Sacred Revelation Ministry Trust Dashboard.
 * Always uses the 'sacred' theme (purple/gold).
 */
export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  // Set theme on mount
  useEffect(() => {
    setMounted(true)
    // Force sacred theme
    localStorage.setItem('dashboard-theme', 'sacred')
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout
      ministryName="Sacred Revelation"
      logoUrl={undefined}
      defaultTheme="sacred"
      isDemo={false}
    >
      {children}
    </DashboardLayout>
  )
}
