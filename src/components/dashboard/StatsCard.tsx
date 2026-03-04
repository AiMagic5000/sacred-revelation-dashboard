'use client'

import { LucideIcon } from 'lucide-react'
import { DashboardTheme, getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  theme: DashboardTheme
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  theme,
}: StatsCardProps) {
  const classes = getThemeClasses(theme)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'p-3 rounded-lg',
            classes.bgLight
          )}
        >
          <Icon className={cn('w-6 h-6', classes.textPrimary)} />
        </div>
      </div>
    </div>
  )
}
