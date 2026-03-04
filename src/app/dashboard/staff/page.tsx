'use client'

import { useState } from 'react'
import { DashboardTheme, getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/ThemeProvider'
import {
  Users,
  Plus,
  Mail,
  Phone,
  Shield,
  Edit2,
  Trash2,
  Search,
  MoreVertical,
  UserPlus,
  Key,
} from 'lucide-react'

interface StaffMember {
  id: string
  name: string
  email: string
  phone: string
  role: 'pastor' | 'elder' | 'deacon' | 'admin' | 'volunteer_coordinator' | 'youth_leader' | 'music_director'
  title: string
  avatar?: string
  status: 'active' | 'inactive'
  joinDate: string
  permissions: string[]
}

const mockStaff: StaffMember[] = [
  {
    id: '1',
    name: 'Pastor James Wilson',
    email: 'pastor.james@gracechurch.org',
    phone: '(555) 123-4567',
    role: 'pastor',
    title: 'Senior Pastor',
    status: 'active',
    joinDate: '2015-03-15',
    permissions: ['all']
  },
  {
    id: '2',
    name: 'Elder Michael Brown',
    email: 'michael.b@gracechurch.org',
    phone: '(555) 234-5678',
    role: 'elder',
    title: 'Elder / Board Member',
    status: 'active',
    joinDate: '2018-06-01',
    permissions: ['finances', 'members', 'documents']
  },
  {
    id: '3',
    name: 'Sarah Davis',
    email: 'sarah.d@gracechurch.org',
    phone: '(555) 345-6789',
    role: 'youth_leader',
    title: 'Youth Pastor',
    status: 'active',
    joinDate: '2020-01-15',
    permissions: ['members', 'events', 'volunteers']
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.k@gracechurch.org',
    phone: '(555) 456-7890',
    role: 'music_director',
    title: 'Worship Director',
    status: 'active',
    joinDate: '2019-08-20',
    permissions: ['events', 'volunteers']
  },
  {
    id: '5',
    name: 'Lisa Martinez',
    email: 'lisa.m@gracechurch.org',
    phone: '(555) 567-8901',
    role: 'admin',
    title: 'Church Administrator',
    status: 'active',
    joinDate: '2017-11-10',
    permissions: ['finances', 'members', 'documents', 'events']
  },
  {
    id: '6',
    name: 'Robert Johnson',
    email: 'robert.j@gracechurch.org',
    phone: '(555) 678-9012',
    role: 'deacon',
    title: 'Deacon',
    status: 'active',
    joinDate: '2021-04-05',
    permissions: ['members', 'volunteers']
  }
]

const roleColors = {
  pastor: 'bg-purple-100 text-purple-800',
  elder: 'bg-blue-100 text-blue-800',
  deacon: 'bg-indigo-100 text-indigo-800',
  admin: 'bg-gray-100 text-gray-800',
  volunteer_coordinator: 'bg-green-100 text-green-800',
  youth_leader: 'bg-amber-100 text-amber-800',
  music_director: 'bg-pink-100 text-pink-800'
}

const roleLabels = {
  pastor: 'Pastor',
  elder: 'Elder',
  deacon: 'Deacon',
  admin: 'Administrator',
  volunteer_coordinator: 'Volunteer Coordinator',
  youth_leader: 'Youth Leader',
  music_director: 'Music Director'
}

export default function StaffPage() {
  return (
    <ThemeProvider>
      {(theme) => <StaffContent theme={theme} />}
    </ThemeProvider>
  )
}

function StaffContent({ theme }: { theme: DashboardTheme }) {
  const classes = getThemeClasses(theme)

  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredStaff = mockStaff.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === 'all' || staff.role === filterRole
    return matchesSearch && matchesRole
  })

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-1">Manage staff members and access permissions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium',
            classes.bgPrimary,
            'hover:opacity-90 transition-opacity'
          )}
        >
          <UserPlus className="w-5 h-5" />
          Add Staff Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Users className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{mockStaff.length}</p>
              <p className="text-sm text-gray-600">Total Staff</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {mockStaff.filter(s => s.status === 'active').length}
              </p>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-100">
              <Key className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {mockStaff.filter(s => ['pastor', 'elder'].includes(s.role)).length}
              </p>
              <p className="text-sm text-gray-600">Leadership</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-amber-100">
              <UserPlus className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">2</p>
              <p className="text-sm text-gray-600">New This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            {Object.entries(roleLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map(staff => (
          <div key={staff.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold',
                  classes.bgPrimary
                )}>
                  {getInitials(staff.name)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{staff.name}</h3>
                  <p className="text-sm text-gray-600">{staff.title}</p>
                </div>
              </div>
              <button className="p-1.5 hover:bg-gray-100 rounded">
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="mb-4">
              <span className={cn(
                'text-xs px-2 py-1 rounded-full font-medium',
                roleColors[staff.role]
              )}>
                {roleLabels[staff.role]}
              </span>
              <span className={cn(
                'ml-2 text-xs px-2 py-1 rounded-full font-medium',
                staff.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              )}>
                {staff.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <a href={`mailto:${staff.email}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <Mail className="w-4 h-4" />
                {staff.email}
              </a>
              <a href={`tel:${staff.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <Phone className="w-4 h-4" />
                {staff.phone}
              </a>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Permissions</p>
              <div className="flex flex-wrap gap-1">
                {staff.permissions.slice(0, 3).map(perm => (
                  <span key={perm} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {perm}
                  </span>
                ))}
                {staff.permissions.length > 3 && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    +{staff.permissions.length - 3}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              <button className={cn(
                'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors'
              )}>
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors text-red-600 hover:bg-red-50 hover:border-red-200">
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
          <button
            onClick={() => { setSearchQuery(''); setFilterRole('all'); }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
