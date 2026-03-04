'use client'

import { DashboardTheme, dashboardConfigs, getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'

interface ThemeSwitcherProps {
  currentTheme: DashboardTheme
  onThemeChange: (theme: DashboardTheme) => void
}

export function ThemeSwitcher({ currentTheme, onThemeChange }: ThemeSwitcherProps) {
  const themeOptions: DashboardTheme[] = ['sacred', 'kingdom']

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      {themeOptions.map((theme) => {
        const config = dashboardConfigs[theme]
        const classes = getThemeClasses(theme)
        const isActive = currentTheme === theme

        return (
          <button
            key={theme}
            onClick={() => onThemeChange(theme)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200',
              isActive
                ? cn(classes.bgPrimary, 'text-white shadow-md')
                : 'text-gray-600 hover:bg-gray-200'
            )}
          >
            <span className="text-lg">{config.icon}</span>
            <span className="hidden sm:inline">
              {theme === 'sacred' ? 'Sacred' : 'Kingdom'}
            </span>
          </button>
        )
      })}
    </div>
  )
}
