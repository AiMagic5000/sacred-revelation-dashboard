'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Calendar,
  Shield,
  MoreVertical,
  Edit,
  Trash2,
} from 'lucide-react'
import { DashboardTheme, getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'

interface Trustee {
  id: string
  name: string
  email: string
  phone: string
  role: 'chairman' | 'secretary' | 'treasurer' | 'trustee'
  status: 'active' | 'inactive'
  appointedDate: string
  termExpires: string
  responsibilities: string[]
}

export default function TrusteesPage() {
  const [theme, setTheme] = useState<DashboardTheme>('sacred')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('dashboard-theme') as DashboardTheme
    if (saved) setTheme(saved)
  }, [])

  const classes = getThemeClasses(theme)

  // Sample trustees
  const trustees: Trustee[] = [
    {
      id: '1',
      name: 'Pastor David Thompson',
      email: 'pastor.thompson@ministry.org',
      phone: '(555) 111-2222',
      role: 'chairman',
      status: 'active',
      appointedDate: '2020-01-15',
      termExpires: '2026-01-15',
      responsibilities: ['Spiritual Leadership', 'Ministry Vision', 'Board Meetings'],
    },
    {
      id: '2',
      name: 'Margaret Williams',
      email: 'mwilliams@email.com',
      phone: '(555) 222-3333',
      role: 'secretary',
      status: 'active',
      appointedDate: '2021-03-20',
      termExpires: '2027-03-20',
      responsibilities: ['Meeting Minutes', 'Record Keeping', 'Communications'],
    },
    {
      id: '3',
      name: 'Robert Chen',
      email: 'rchen@email.com',
      phone: '(555) 333-4444',
      role: 'treasurer',
      status: 'active',
      appointedDate: '2022-06-10',
      termExpires: '2028-06-10',
      responsibilities: ['Financial Oversight', 'Budget Management', 'Reporting'],
    },
    {
      id: '4',
      name: 'Sandra Martinez',
      email: 'smartinez@email.com',
      phone: '(555) 444-5555',
      role: 'trustee',
      status: 'active',
      appointedDate: '2023-01-01',
      termExpires: '2029-01-01',
      responsibilities: ['Community Outreach', 'Ministry Programs'],
    },
    {
      id: '5',
      name: 'James Anderson',
      email: 'janderson@email.com',
      phone: '(555) 555-6666',
      role: 'trustee',
      status: 'active',
      appointedDate: '2023-06-15',
      termExpires: '2029-06-15',
      responsibilities: ['Facility Management', 'Event Coordination'],
    },
  ]

  const filteredTrustees = trustees.filter((trustee) =>
    trustee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trustee.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'chairman': return 'bg-purple-100 text-purple-800'
      case 'secretary': return 'bg-blue-100 text-blue-800'
      case 'treasurer': return 'bg-green-100 text-green-800'
      case 'trustee': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'chairman': return 'Board Chairman'
      case 'secretary': return 'Board Secretary'
      case 'treasurer': return 'Board Treasurer'
      case 'trustee': return 'Trustee'
      default: return role
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Board of Trustees</h1>
          <p className="text-gray-500 mt-1">
            Manage your ministry's governing board members
          </p>
        </div>
        <button className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
          classes.buttonPrimary
        )}>
          <Plus className="w-5 h-5" />
          Add Trustee
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Trustees</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{trustees.length}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Users className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Members</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {trustees.filter(t => t.status === 'active').length}
              </p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Shield className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Officers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {trustees.filter(t => t.role !== 'trustee').length}
              </p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Users className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Terms Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Calendar className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search trustees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': theme === 'sacred' ? '#7E22CE' : '#1E3A5F' } as any}
          />
        </div>
      </div>

      {/* Trustees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrustees.map((trustee) => (
          <div key={trustee.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-lg',
                    classes.bgPrimary
                  )}>
                    {trustee.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{trustee.name}</h3>
                    <span className={cn(
                      'inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1',
                      getRoleBadge(trustee.role)
                    )}>
                      {getRoleTitle(trustee.role)}
                    </span>
                  </div>
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {trustee.email}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {trustee.phone}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Responsibilities</p>
                <div className="flex flex-wrap gap-1">
                  {trustee.responsibilities.map((resp, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                    >
                      {resp}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Appointed: {trustee.appointedDate}</span>
                <span>Term expires: {trustee.termExpires}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTrustees.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-500 mt-4">No trustees found</p>
        </div>
      )}

      {/* Board Meeting Schedule */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Board Meetings</h2>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', classes.bgLight)}>
                  <Calendar className={cn('w-5 h-5', classes.textPrimary)} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Q1 Board Meeting</p>
                  <p className="text-sm text-gray-500">January 15, 2025 at 7:00 PM</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                Scheduled
              </span>
            </div>
          </div>
          <div className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', classes.bgLight)}>
                  <Calendar className={cn('w-5 h-5', classes.textPrimary)} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Annual Planning Session</p>
                  <p className="text-sm text-gray-500">February 5, 2025 at 6:00 PM</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                Scheduled
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
