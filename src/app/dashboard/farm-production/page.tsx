'use client'

import { useState, useEffect } from 'react'
import {
  Wheat,
  Plus,
  TrendingUp,
  Calendar,
  Droplets,
  Thermometer,
  Package,
} from 'lucide-react'
import { DashboardTheme, getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'

interface ProductionLog {
  id: string
  date: string
  crop: string
  quantity: number
  unit: string
  harvestType: 'harvest' | 'planting' | 'maintenance'
  notes: string
}

interface CropStatus {
  name: string
  status: 'growing' | 'ready' | 'harvested' | 'planned'
  planted: string
  expectedHarvest: string
  area: string
}

export default function ProductionPage() {
  const [theme, setTheme] = useState<DashboardTheme>('sacred')
  const [timeRange, setTimeRange] = useState('month')

  useEffect(() => {
    const saved = localStorage.getItem('dashboard-theme') as DashboardTheme
    if (saved) setTheme(saved)
  }, [])

  const classes = getThemeClasses(theme)

  // Sample production logs
  const productionLogs: ProductionLog[] = [
    { id: '1', date: '2024-12-22', crop: 'Tomatoes', quantity: 450, unit: 'lbs', harvestType: 'harvest', notes: 'Great yield this week' },
    { id: '2', date: '2024-12-20', crop: 'Lettuce', quantity: 200, unit: 'heads', harvestType: 'harvest', notes: 'Ready for distribution' },
    { id: '3', date: '2024-12-18', crop: 'Carrots', quantity: 300, unit: 'lbs', harvestType: 'harvest', notes: 'Winter variety' },
    { id: '4', date: '2024-12-15', crop: 'Winter Squash', quantity: 150, unit: 'lbs', harvestType: 'harvest', notes: 'From greenhouse' },
    { id: '5', date: '2024-12-12', crop: 'Kale', quantity: 125, unit: 'bunches', harvestType: 'harvest', notes: 'Cold weather crop' },
  ]

  // Crop status tracking
  const cropStatus: CropStatus[] = [
    { name: 'Winter Greens', status: 'growing', planted: '2024-10-15', expectedHarvest: '2025-01-15', area: '2 acres' },
    { name: 'Root Vegetables', status: 'ready', planted: '2024-09-01', expectedHarvest: '2024-12-20', area: '1.5 acres' },
    { name: 'Greenhouse Tomatoes', status: 'growing', planted: '2024-11-01', expectedHarvest: '2025-02-01', area: '0.5 acres' },
    { name: 'Spring Lettuce', status: 'planned', planted: '2025-02-15', expectedHarvest: '2025-04-15', area: '1 acre' },
  ]

  const totalProduced = productionLogs.reduce((sum, log) => sum + log.quantity, 0)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'growing': return 'bg-blue-100 text-blue-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'harvested': return 'bg-gray-100 text-gray-800'
      case 'planned': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getHarvestBadge = (type: string) => {
    switch (type) {
      case 'harvest': return 'bg-green-100 text-green-800'
      case 'planting': return 'bg-blue-100 text-blue-800'
      case 'maintenance': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Food Production</h1>
          <p className="text-gray-500 mt-1">
            Track crops, harvests, and agricultural activities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
            classes.buttonPrimary
          )}>
            <Plus className="w-5 h-5" />
            Log Production
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Produced</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalProduced.toLocaleString()} lbs
              </p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Package className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-600 font-medium">18%</span>
            <span className="text-gray-500">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Crops</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {cropStatus.filter(c => c.status === 'growing').length}
              </p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Wheat className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ready to Harvest</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {cropStatus.filter(c => c.status === 'ready').length}
              </p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Calendar className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Farm Area</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">5 acres</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Droplets className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crop Status */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Crop Status</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {cropStatus.map((crop, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{crop.name}</h3>
                  <span className={cn(
                    'px-2 py-1 text-xs font-medium rounded-full capitalize',
                    getStatusBadge(crop.status)
                  )}>
                    {crop.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-500">
                  <div>
                    <span className="block text-xs text-gray-400">Planted</span>
                    {crop.planted}
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400">Harvest</span>
                    {crop.expectedHarvest}
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400">Area</span>
                    {crop.area}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weather Conditions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Growing Conditions</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Thermometer className="w-5 h-5 text-orange-500" />
                <span className="text-gray-700">Temperature</span>
              </div>
              <span className="font-semibold text-gray-900">45°F / 7°C</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Droplets className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700">Soil Moisture</span>
              </div>
              <span className="font-semibold text-gray-900">68%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Growing Season</span>
              </div>
              <span className="font-semibold text-gray-900">Winter</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Production Logs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Production Logs</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Crop</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {productionLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-500">{log.date}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Wheat className={cn('w-4 h-4', classes.textPrimary)} />
                    <span className="font-medium text-gray-900">{log.crop}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  {log.quantity} {log.unit}
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    'px-2 py-1 text-xs font-medium rounded-full capitalize',
                    getHarvestBadge(log.harvestType)
                  )}>
                    {log.harvestType}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{log.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
