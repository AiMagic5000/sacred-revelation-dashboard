'use client'

import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { DashboardTheme, getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'

interface ActivityItem {
  id: string
  type: 'donation' | 'volunteer' | 'distribution' | 'production' | 'document' | 'settings' | 'member'
  action: string
  description: string
  user: string
  timestamp: string
  metadata?: Record<string, any>
}

export default function ActivityPage() {
  const [theme, setTheme] = useState<DashboardTheme>('sacred')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    const saved = localStorage.getItem('dashboard-theme') as DashboardTheme
    if (saved) setTheme(saved)
  }, [])

  const classes = getThemeClasses(theme)

  // Sample activity log
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'donation',
      action: 'Donation received',
      description: 'Anonymous donation of $1,000 for Building Fund',
      user: 'System',
      timestamp: '2024-12-24 10:30 AM',
      metadata: { amount: 1000, category: 'Building Fund' },
    },
    {
      id: '2',
      type: 'volunteer',
      action: 'Volunteer registered',
      description: 'James Wilson joined as Field Worker',
      user: 'Admin',
      timestamp: '2024-12-23 3:45 PM',
    },
    {
      id: '3',
      type: 'distribution',
      action: 'Distribution completed',
      description: 'Community Center distribution - 45 families served',
      user: 'Sarah Johnson',
      timestamp: '2024-12-21 1:00 PM',
      metadata: { families: 45, pounds: 1350 },
    },
    {
      id: '4',
      type: 'production',
      action: 'Outreach completed',
      description: 'Food distribution to 45 families',
      user: 'Patricia Ward',
      timestamp: '2024-12-22 11:15 AM',
      metadata: { program: 'Food Ministry', families: 45 },
    },
    {
      id: '5',
      type: 'document',
      action: 'Document uploaded',
      description: 'Q4 Financial Statement uploaded',
      user: 'Treasurer',
      timestamp: '2024-12-20 9:00 AM',
    },
    {
      id: '6',
      type: 'settings',
      action: 'Settings updated',
      description: 'Ministry branding colors changed',
      user: 'Admin',
      timestamp: '2024-12-19 4:30 PM',
    },
    {
      id: '7',
      type: 'donation',
      action: 'Donation received',
      description: 'Grace Community Church donation of $2,500',
      user: 'System',
      timestamp: '2024-12-15 2:00 PM',
      metadata: { amount: 2500, donor: 'Grace Community Church' },
    },
    {
      id: '8',
      type: 'distribution',
      action: 'Distribution scheduled',
      description: 'Downtown Plaza distribution scheduled for Dec 28',
      user: 'Sarah Johnson',
      timestamp: '2024-12-14 10:00 AM',
    },
    {
      id: '9',
      type: 'volunteer',
      action: 'Volunteer hours logged',
      description: 'Emily Rodriguez logged 8 hours',
      user: 'Emily Rodriguez',
      timestamp: '2024-12-13 5:00 PM',
    },
    {
      id: '10',
      type: 'production',
      action: 'Crop status updated',
      description: 'Winter Greens status changed to Growing',
      user: 'Michael Chen',
      timestamp: '2024-12-12 3:00 PM',
    },
  ]

  const activityTypes = [
    { value: 'all', label: 'All Activity' },
    { value: 'donation', label: 'Donations' },
    { value: 'volunteer', label: 'Volunteers' },
    { value: 'distribution', label: 'Distribution' },
    { value: 'production', label: 'Production' },
    { value: 'document', label: 'Documents' },
    { value: 'settings', label: 'Settings' },
  ]

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          activity.action.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || activity.type === filterType
    return matchesSearch && matchesType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'donation': return DollarSign
      case 'volunteer': return Users
      case 'distribution': return Truck
      case 'production': return Wheat
      case 'document': return FileText
      case 'settings': return Settings
      case 'member': return User
      default: return Activity
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'donation': return 'bg-green-100 text-green-800'
      case 'volunteer': return 'bg-blue-100 text-blue-800'
      case 'distribution': return 'bg-purple-100 text-purple-800'
      case 'production': return 'bg-purple-200 text-purple-950'
      case 'document': return 'bg-orange-100 text-orange-800'
      case 'settings': return 'bg-gray-100 text-gray-800'
      case 'member': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = activity.timestamp.split(' ')[0]
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(activity)
    return groups
  }, {} as Record<string, ActivityItem[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-gray-500 mt-1">
            Track all actions and changes in your ministry dashboard
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
          <Download className="w-5 h-5" />
          Export Log
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search activity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': theme === 'sacred' ? '#7E22CE' : '#1E3A5F' } as any}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': theme === 'sacred' ? '#7E22CE' : '#1E3A5F' } as any}
            >
              {activityTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {Object.entries(groupedActivities).map(([date, dateActivities]) => (
          <div key={date}>
            {/* Date Header */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">{date}</h3>
            </div>

            {/* Activities for this date */}
            <div className="divide-y divide-gray-100">
              {dateActivities.map((activity) => {
                const Icon = getTypeIcon(activity.type)
                return (
                  <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        'p-2 rounded-lg',
                        getTypeBadge(activity.type).replace('text-', 'bg-').split(' ')[0]
                      )}>
                        <Icon className={cn('w-4 h-4', getTypeBadge(activity.type).split(' ')[1])} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{activity.action}</h4>
                          <span className={cn(
                            'px-2 py-0.5 text-xs font-medium rounded-full capitalize',
                            getTypeBadge(activity.type)
                          )}>
                            {activity.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {activity.user}
                          </span>
                          <span>{activity.timestamp.split(' ').slice(1).join(' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-gray-500 mt-4">No activity found</p>
          </div>
        )}
      </div>
    </div>
  )
}
