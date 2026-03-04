'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Activity,
  Filter,
  Search,
  User,
  FileText,
  DollarSign,
  Users,
  Truck,
  Wheat,
  Settings,
  Download,
  Calendar,
  Heart,
  Music,
  Shield,
  GraduationCap,
  Loader2,
  RefreshCw,
} from 'lucide-react'

interface ActivityLog {
  id: string
  type: string
  description: string
  created_at: string
  metadata?: Record<string, unknown>
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const fetchActivities = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/activity-logs?limit=100')
      if (res.ok) {
        const data = await res.json()
        setActivities(data.logs || [])
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  const activityTypes = [
    { value: 'all', label: 'All Activity' },
    { value: 'donation', label: 'Donations' },
    { value: 'volunteer', label: 'Volunteers' },
    { value: 'event', label: 'Events' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'document', label: 'Documents' },
    { value: 'healing', label: 'Healing' },
    { value: 'music', label: 'Music' },
    { value: 'distribution', label: 'Distribution' },
    { value: 'production', label: 'Production' },
  ]

  const filteredActivities = activities.filter((a) => {
    const matchesSearch = a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.type.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || a.type.toLowerCase().includes(filterType)
    return matchesSearch && matchesType
  })

  const getTypeIcon = (type: string) => {
    if (type.includes('donation')) return DollarSign
    if (type.includes('volunteer') || type.includes('member')) return Users
    if (type.includes('event') || type.includes('schedule')) return Calendar
    if (type.includes('compliance')) return Shield
    if (type.includes('document')) return FileText
    if (type.includes('healing')) return Heart
    if (type.includes('music')) return Music
    if (type.includes('distribution')) return Truck
    if (type.includes('production') || type.includes('farm')) return Wheat
    if (type.includes('coaching')) return GraduationCap
    if (type.includes('settings')) return Settings
    return Activity
  }

  const getTypeBadge = (type: string) => {
    if (type.includes('donation')) return 'bg-emerald-100 text-emerald-800'
    if (type.includes('volunteer')) return 'bg-sky-100 text-sky-800'
    if (type.includes('event')) return 'bg-indigo-100 text-indigo-800'
    if (type.includes('compliance')) return 'bg-amber-100 text-amber-800'
    if (type.includes('document')) return 'bg-purple-100 text-purple-800'
    if (type.includes('healing')) return 'bg-rose-100 text-rose-800'
    if (type.includes('music')) return 'bg-pink-100 text-pink-800'
    if (type.includes('distribution')) return 'bg-violet-100 text-violet-800'
    if (type.includes('production')) return 'bg-lime-100 text-lime-800'
    return 'bg-slate-100 text-slate-800'
  }

  // Group by date
  const grouped = filteredActivities.reduce((acc, item) => {
    const dateKey = new Date(item.created_at).toDateString()
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(item)
    return acc
  }, {} as Record<string, ActivityLog[]>)

  const handleExport = () => {
    const csv = [
      'Date,Type,Description',
      ...filteredActivities.map(a =>
        `"${new Date(a.created_at).toLocaleString()}","${a.type}","${a.description.replace(/"/g, '""')}"`
      )
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-600" />
            Activity Log
          </h1>
          <p className="text-slate-500 mt-1">
            Track all actions and changes in your ministry dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchActivities}
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Activities', value: activities.length, color: 'purple' },
          { label: 'Today', value: activities.filter(a => new Date(a.created_at).toDateString() === new Date().toDateString()).length, color: 'emerald' },
          { label: 'This Week', value: activities.filter(a => Date.now() - new Date(a.created_at).getTime() < 7 * 86400000).length, color: 'sky' },
          { label: 'Types', value: new Set(activities.map(a => a.type)).size, color: 'amber' },
        ].map((stat, i) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 text-${stat.color}-600`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search activity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all bg-white"
            >
              {activityTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-400 mt-3">Loading activity log...</p>
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-500 mt-4 font-medium">No activity found</p>
            <p className="text-slate-400 text-sm mt-1">Actions you take in the dashboard will appear here</p>
          </div>
        ) : (
          Object.entries(grouped).map(([dateKey, items]) => (
            <div key={dateKey}>
              <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-600">{formatDate(items[0].created_at)}</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {items.map((activity, idx) => {
                  const Icon = getTypeIcon(activity.type)
                  const badge = getTypeBadge(activity.type)
                  return (
                    <div
                      key={activity.id}
                      className="px-6 py-4 hover:bg-slate-50/50 transition-colors animate-fade-up"
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-xl ${badge.split(' ')[0]}`}>
                          <Icon className={`w-4 h-4 ${badge.split(' ')[1]}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-slate-900">{activity.description}</p>
                            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full capitalize whitespace-nowrap ${badge}`}>
                              {activity.type.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              System
                            </span>
                            <span>{timeAgo(activity.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
