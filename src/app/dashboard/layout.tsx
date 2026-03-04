'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard'

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    localStorage.setItem('dashboard-theme', 'sacred')
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #7C3AED, #4338CA)'
            }}>
              <span className="text-white text-2xl font-bold">&#10014;</span>
            </div>
            <div className="absolute inset-0 w-16 h-16 mx-auto rounded-2xl animate-ping opacity-20" style={{
              background: 'linear-gradient(135deg, #7C3AED, #4338CA)'
            }} />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500">Loading Sacred Revelation...</p>
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
