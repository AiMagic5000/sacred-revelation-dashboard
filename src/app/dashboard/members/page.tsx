'use client'

import { useState, useEffect } from 'react'
import {
  Building2,
  Plus,
  Search,
  Mail,
  Phone,
  Calendar,
  Users,
  Filter,
  Download,
  UserCheck,
  Heart,
} from 'lucide-react'
import { DashboardTheme, getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'

interface Member {
  id: string
  name: string
  email: string
  phone: string
  address: string
  membershipType: 'regular' | 'associate' | 'honorary' | 'youth'
  status: 'active' | 'inactive' | 'pending'
  joinedDate: string
  familySize: number
  ministryInvolvement: string[]
  lastAttendance: string
}

export default function MembersPage() {
  const [theme, setTheme] = useState<DashboardTheme>('sacred')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    const saved = localStorage.getItem('dashboard-theme') as DashboardTheme
    if (saved) setTheme(saved)
  }, [])

  const classes = getThemeClasses(theme)

  // Sample members
  const members: Member[] = [
    {
      id: '1',
      name: 'The Johnson Family',
      email: 'johnson.family@email.com',
      phone: '(555) 123-4567',
      address: '123 Oak Street, Springfield',
      membershipType: 'regular',
      status: 'active',
      joinedDate: '2018-06-15',
      familySize: 4,
      ministryInvolvement: ['Worship Team', 'Youth Ministry'],
      lastAttendance: '2024-12-22',
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'msantos@email.com',
      phone: '(555) 234-5678',
      address: '456 Maple Avenue, Springfield',
      membershipType: 'regular',
      status: 'active',
      joinedDate: '2020-01-10',
      familySize: 1,
      ministryInvolvement: ['Choir', 'Outreach'],
      lastAttendance: '2024-12-22',
    },
    {
      id: '3',
      name: 'The Williams Family',
      email: 'williams@email.com',
      phone: '(555) 345-6789',
      address: '789 Elm Drive, Springfield',
      membershipType: 'regular',
      status: 'active',
      joinedDate: '2015-03-20',
      familySize: 5,
      ministryInvolvement: ['Sunday School', 'Prayer Team'],
      lastAttendance: '2024-12-22',
    },
    {
      id: '4',
      name: 'Robert Chen',
      email: 'rchen@email.com',
      phone: '(555) 456-7890',
      address: '321 Pine Road, Springfield',
      membershipType: 'associate',
      status: 'active',
      joinedDate: '2023-08-05',
      familySize: 2,
      ministryInvolvement: ['Tech Team'],
      lastAttendance: '2024-12-15',
    },
    {
      id: '5',
      name: 'The Garcia Family',
      email: 'garcia.family@email.com',
      phone: '(555) 567-8901',
      address: '654 Birch Lane, Springfield',
      membershipType: 'regular',
      status: 'active',
      joinedDate: '2019-11-30',
      familySize: 3,
      ministryInvolvement: ['Hospitality', 'Missions'],
      lastAttendance: '2024-12-22',
    },
    {
      id: '6',
      name: 'Emily Thompson',
      email: 'ethompson@email.com',
      phone: '(555) 678-9012',
      address: '987 Cedar Court, Springfield',
      membershipType: 'youth',
      status: 'active',
      joinedDate: '2024-01-15',
      familySize: 1,
      ministryInvolvement: ['Youth Group', 'Worship Team'],
      lastAttendance: '2024-12-22',
    },
    {
      id: '7',
      name: 'James & Martha Wilson',
      email: 'wilsons@email.com',
      phone: '(555) 789-0123',
      address: '147 Walnut Way, Springfield',
      membershipType: 'honorary',
      status: 'active',
      joinedDate: '2005-04-10',
      familySize: 2,
      ministryInvolvement: ['Senior Ministry'],
      lastAttendance: '2024-12-08',
    },
    {
      id: '8',
      name: 'David Park',
      email: 'dpark@email.com',
      phone: '(555) 890-1234',
      address: '258 Spruce Street, Springfield',
      membershipType: 'regular',
      status: 'pending',
      joinedDate: '2024-12-01',
      familySize: 1,
      ministryInvolvement: [],
      lastAttendance: '2024-12-22',
    },
  ]

  const membershipTypes = [
    { value: 'all', label: 'All Members' },
    { value: 'regular', label: 'Regular Members' },
    { value: 'associate', label: 'Associate Members' },
    { value: 'youth', label: 'Youth Members' },
    { value: 'honorary', label: 'Honorary Members' },
  ]

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || member.membershipType === filterType
    return matchesSearch && matchesType
  })

  const totalFamilies = members.length
  const totalIndividuals = members.reduce((sum, m) => sum + m.familySize, 0)
  const activeMembers = members.filter(m => m.status === 'active').length

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'regular': return 'bg-blue-100 text-blue-800'
      case 'associate': return 'bg-purple-100 text-purple-800'
      case 'youth': return 'bg-green-100 text-green-800'
      case 'honorary': return 'bg-amber-100 text-amber-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Church Members</h1>
          <p className="text-gray-500 mt-1">
            Manage your congregation and ministry involvement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            <Download className="w-5 h-5" />
            Export
          </button>
          <button className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
            classes.buttonPrimary
          )}>
            <Plus className="w-5 h-5" />
            Add Member
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Families/Households</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalFamilies}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Building2 className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Individuals</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalIndividuals}</p>
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
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeMembers}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <UserCheck className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">New This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {members.filter(m => m.joinedDate.startsWith('2024-12')).length}
              </p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Heart className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
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
              {membershipTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Member</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Family Size</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ministry Involvement</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredMembers.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium',
                      classes.bgPrimary
                    )}>
                      {member.name.split(' ')[0][0]}{member.name.includes('Family') ? 'F' : member.name.split(' ')[1]?.[0] || ''}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-500">Joined {member.joinedDate}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    'px-2 py-1 text-xs font-medium rounded-full capitalize',
                    getTypeBadge(member.membershipType)
                  )}>
                    {member.membershipType}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{member.familySize}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {member.ministryInvolvement.length > 0 ? (
                      member.ministryInvolvement.slice(0, 2).map((ministry, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                          {ministry}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">None yet</span>
                    )}
                    {member.ministryInvolvement.length > 2 && (
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                        +{member.ministryInvolvement.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    'px-2 py-1 text-xs font-medium rounded-full capitalize',
                    getStatusBadge(member.status)
                  )}>
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Email">
                      <Mail className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Phone">
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-gray-500 mt-4">No members found</p>
          </div>
        )}
      </div>

      {/* Ministry Involvement Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ministry Involvement Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {['Worship Team', 'Youth Ministry', 'Choir', 'Outreach', 'Sunday School', 'Prayer Team', 'Tech Team', 'Hospitality', 'Missions', 'Senior Ministry', 'Youth Group'].map((ministry) => {
            const count = members.filter(m => m.ministryInvolvement.includes(ministry)).length
            return (
              <div key={ministry} className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500 mt-1">{ministry}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
