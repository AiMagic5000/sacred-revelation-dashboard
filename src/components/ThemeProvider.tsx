'use client'

import { Suspense, ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { DashboardTheme } from '@/lib/themes'

interface ThemeProviderProps {
  children: (theme: DashboardTheme) => ReactNode
  fallback?: ReactNode
}

function ThemeDetector({ children }: { children: (theme: DashboardTheme) => ReactNode }) {
  const searchParams = useSearchParams()
  const themeParam = searchParams.get('theme') as DashboardTheme | null
  const theme: DashboardTheme = themeParam === 'kingdom' ? 'kingdom' : 'sacred'
  return <>{children(theme)}</>
}

function DefaultLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-gray-300 border-t-purple-700 rounded-full animate-spin" />
    </div>
  )
}

export function ThemeProvider({ children, fallback }: ThemeProviderProps) {
  return (
    <Suspense fallback={fallback || <DefaultLoading />}>
      <ThemeDetector>{children}</ThemeDetector>
    </Suspense>
  )
}
