'use client'

import { DashboardTheme, getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/ThemeProvider'
import {
  Fish,
  Sprout,
  TreeDeciduous,
  Calendar,
  Waves,
  Droplets,
  CheckCircle,
  Layers,
  Clock,
  Home,
} from 'lucide-react'

export default function FoodProductionPage() {
  return (
    <ThemeProvider>
      {(theme) => <FoodProductionContent theme={theme} />}
    </ThemeProvider>
  )
}

function FoodProductionContent({ theme }: { theme: DashboardTheme }) {
  const classes = getThemeClasses(theme)

  const waterParameters = [
    { label: 'Temperature', value: '82°F', optimal: '75-85°F', status: 'good' },
    { label: 'pH Level', value: '7.0', optimal: '6.8-7.2', status: 'good' },
    { label: 'Ammonia', value: '0.2 ppm', optimal: '< 0.5 ppm', status: 'good' },
    { label: 'Nitrite', value: '0.1 ppm', optimal: '< 0.5 ppm', status: 'good' },
    { label: 'Nitrate', value: '45 ppm', optimal: '5-150 ppm', status: 'good' },
    { label: 'Dissolved O2', value: '6.2 ppm', optimal: '> 5 ppm', status: 'good' },
  ]

  const tabs = [
    { label: 'System Overview', icon: Layers, active: true },
    { label: 'Fish Production', icon: Fish, active: false },
    { label: 'Vertical Towers', icon: Sprout, active: false },
    { label: 'Food Forest', icon: TreeDeciduous, active: false },
    { label: 'Daily SOPs', icon: Clock, active: false },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Waves className={cn('w-8 h-8', classes.textPrimary)} />
          1,000+ lbs of Food Production
        </h1>
        <p className="text-gray-500">Florida Outdoor Vertical Farming & Aquaponics System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 text-center">
          <Fish className="w-10 h-10 mx-auto mb-2" />
          <p className="text-3xl font-bold">0 lbs</p>
          <p className="text-sm opacity-90">Fish per Month</p>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl p-6 text-center">
          <Sprout className="w-10 h-10 mx-auto mb-2" />
          <p className="text-3xl font-bold">0 lbs</p>
          <p className="text-sm opacity-90">Vertical Gardens</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl p-6 text-center">
          <TreeDeciduous className="w-10 h-10 mx-auto mb-2" />
          <p className="text-3xl font-bold">0 lbs</p>
          <p className="text-sm opacity-90">Food Forest (avg)</p>
        </div>
        <div className={cn('bg-gradient-to-br text-white rounded-xl p-6 text-center', 'from-primary-500 to-primary-600')}>
          <Calendar className="w-10 h-10 mx-auto mb-2" />
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm opacity-90">Days Growing</p>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab, i) => {
          const Icon = tab.icon
          return (
            <button
              key={i}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                tab.active
                  ? cn(classes.bgPrimary, 'text-white')
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Three Column System Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aquaponics System */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Waves className="w-5 h-5 text-blue-500" />
            Aquaponics System
          </h3>
          <ul className="space-y-3">
            {[
              '1,100+ gallon fish tank system (4 IBC totes)',
              'Tilapia primary - 100 lbs/month harvest',
              '4 grow beds (4x8 ft) for bio-filtration',
              'Backup generator for hurricane season',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Vertical Gardens */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-green-500" />
            Vertical Gardens
          </h3>
          <ul className="space-y-3">
            {[
              '25 vertical towers (5 ft each)',
              '200+ active plant sites',
              'Leafy greens & herbs primary crops',
              '50% shade cloth for Florida sun',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Food Forest */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TreeDeciduous className="w-5 h-5 text-amber-500" />
            Food Forest
          </h3>
          <ul className="space-y-3">
            {[
              'Mango, avocado, citrus, banana, papaya',
              'Moringa, katuk, longevity spinach',
              'Sweet potato, perennial peanut ground cover',
              '40 lbs average monthly (seasonal variation)',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Water Quality Parameters - 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            Water Quality Parameters
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {waterParameters.map((param, i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">{param.label}</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-lg font-bold text-gray-900">{param.value}</p>
                <p className="text-xs text-gray-400">Optimal: {param.optimal}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Space Allocation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Home className={cn('w-5 h-5', classes.textPrimary)} />
            Space Allocation
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Fish Tanks</span>
              <span className="font-medium text-gray-900">200 sq ft</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Vertical Towers</span>
              <span className="font-medium text-gray-900">400 sq ft</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Food Forest</span>
              <span className="font-medium text-gray-900">800+ sq ft</span>
            </div>
            <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-800">Total</span>
              <span className={cn('font-bold', classes.textPrimary)}>2,500 sq ft</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
