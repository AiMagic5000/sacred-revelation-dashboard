'use client'

import { useState } from 'react'
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Shield,
  Edit2,
  Trash2,
  X,
  Loader2,
  Download,
  UserPlus,
  Key,
  Briefcase,
  Filter,
} from 'lucide-react'
import { getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { useStaff, StaffRecord } from '@/hooks/useData'
import { staffApi, CreateStaffData, UpdateStaffData } from '@/lib/api'

const DEPARTMENT_OPTIONS = [
  'Administration',
  'Ministry',
  'Music',
  'Youth',
  'Facilities',
  'Outreach',
] as const
type Department = (typeof DEPARTMENT_OPTIONS)[number]

const SALARY_RANGE_OPTIONS = [
  'Volunteer',
  'Part-time Stipend',
  '$25,000 - $35,000',
  '$35,000 - $50,000',
  '$50,000 - $75,000',
  '$75,000+',
] as const

interface StaffFormData {
  name: string
  email: string
  phone: string
  title: string
  department: Department
  hire_date: string
  salary_range: string
  status: 'active' | 'inactive'
}

const initialFormData: StaffFormData = {
  name: '',
  email: '',
  phone: '',
  title: '',
  department: 'Administration',
  hire_date: '',
  salary_range: 'Volunteer',
  status: 'active',
}

function extractSkillTag(skills: string[], prefix: string): string {
  const tag = (skills || []).find(s => s.startsWith(`${prefix}:`))
  return tag ? tag.slice(prefix.length + 1) : ''
}

function getDepartmentBadge(dept: string) {
  switch (dept) {
    case 'Administration': return 'bg-gray-100 text-gray-800'
    case 'Ministry': return 'bg-purple-100 text-purple-800'
    case 'Music': return 'bg-pink-100 text-pink-800'
    case 'Youth': return 'bg-amber-100 text-amber-800'
    case 'Facilities': return 'bg-blue-100 text-blue-800'
    case 'Outreach': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function StaffPage() {
  const classes = getThemeClasses('sacred')
  const { data: staff, isLoading, mutate } = useStaff()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffRecord | null>(null)
  const [formData, setFormData] = useState<StaffFormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const staffList = staff || []

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      extractSkillTag(s.skills, 'title').toLowerCase().includes(searchQuery.toLowerCase())
    const dept = extractSkillTag(s.skills, 'dept')
    const matchesDept = filterDepartment === 'all' || dept === filterDepartment
    return matchesSearch && matchesDept
  })

  const activeCount = staffList.filter(s => s.status === 'active').length
  const leadershipCount = staffList.filter(s => {
    const title = extractSkillTag(s.skills, 'title').toLowerCase()
    return title.includes('pastor') || title.includes('elder') || title.includes('director')
  }).length
  const newThisMonth = staffList.filter(s => {
    const created = new Date(s.created_at)
    const now = new Date()
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
  }).length

  const openAddModal = () => {
    setEditingStaff(null)
    setFormData(initialFormData)
    setShowModal(true)
  }

  const openEditModal = (staffMember: StaffRecord) => {
    setEditingStaff(staffMember)
    setFormData({
      name: staffMember.name || '',
      email: staffMember.email || '',
      phone: staffMember.phone || '',
      title: extractSkillTag(staffMember.skills, 'title'),
      department: (extractSkillTag(staffMember.skills, 'dept') as Department) || 'Administration',
      hire_date: extractSkillTag(staffMember.skills, 'hired'),
      salary_range: extractSkillTag(staffMember.skills, 'salary') || 'Volunteer',
      status: staffMember.status || 'active',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingStaff(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload: CreateStaffData | UpdateStaffData = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        title: formData.title || undefined,
        department: formData.department,
        hire_date: formData.hire_date || undefined,
        salary_range: formData.salary_range || undefined,
        status: formData.status,
      }

      if (editingStaff) {
        await staffApi.update(editingStaff.id, payload as UpdateStaffData)
      } else {
        await staffApi.create(payload as CreateStaffData)
      }

      await mutate()
      closeModal()
    } catch (error) {
      alert('Failed to save staff member. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return

    setDeleting(id)
    try {
      await staffApi.delete(id)
      await mutate()
    } catch (error) {
      alert('Failed to delete staff member. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const handleExport = () => {
    if (!staffList.length) return

    const headers = ['Name', 'Title', 'Department', 'Email', 'Phone', 'Hire Date', 'Status', 'Salary Range']
    const rows = staffList.map(s => [
      s.name,
      extractSkillTag(s.skills, 'title'),
      extractSkillTag(s.skills, 'dept'),
      s.email || '',
      s.phone || '',
      extractSkillTag(s.skills, 'hired'),
      s.status,
      extractSkillTag(s.skills, 'salary'),
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `staff-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-800" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500 mt-1">
            Manage staff members and ministry workers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={openAddModal}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200',
              classes.buttonPrimary
            )}
          >
            <UserPlus className="w-5 h-5" />
            Add Staff Member
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-md"
             style={{ animationDelay: '0ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{staffList.length}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Users className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-md"
             style={{ animationDelay: '50ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Staff</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-md"
             style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Leadership</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{leadershipCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <Key className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-md"
             style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">New This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{newThisMonth}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50">
              <UserPlus className="w-6 h-6 text-amber-600" />
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
              placeholder="Search staff members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-700"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-700"
            >
              <option value="all">All Departments</option>
              {DEPARTMENT_OPTIONS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      {filteredStaff.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || filterDepartment !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Add your first staff member to get started'}
          </p>
          {searchQuery || filterDepartment !== 'all' ? (
            <button
              onClick={() => { setSearchQuery(''); setFilterDepartment('all') }}
              className="text-purple-700 hover:text-purple-800 font-medium"
            >
              Clear filters
            </button>
          ) : (
            <button
              onClick={openAddModal}
              className={cn('px-4 py-2 rounded-lg font-medium', classes.buttonPrimary)}
            >
              Add First Staff Member
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((staffMember, index) => {
            const title = extractSkillTag(staffMember.skills, 'title')
            const department = extractSkillTag(staffMember.skills, 'dept')
            const hireDate = extractSkillTag(staffMember.skills, 'hired')
            const salaryRange = extractSkillTag(staffMember.skills, 'salary')

            return (
              <div
                key={staffMember.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold',
                      classes.bgPrimary
                    )}>
                      {getInitials(staffMember.name)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{staffMember.name}</h3>
                      <p className="text-sm text-gray-600">{title || 'Staff'}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {department && (
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full font-medium',
                      getDepartmentBadge(department)
                    )}>
                      {department}
                    </span>
                  )}
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full font-medium',
                    staffMember.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  )}>
                    {staffMember.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  {staffMember.email && (
                    <a href={`mailto:${staffMember.email}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                      <Mail className="w-4 h-4" />
                      {staffMember.email}
                    </a>
                  )}
                  {staffMember.phone && (
                    <a href={`tel:${staffMember.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                      <Phone className="w-4 h-4" />
                      {staffMember.phone}
                    </a>
                  )}
                  {hireDate && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      Hired: {hireDate}
                    </div>
                  )}
                </div>

                {salaryRange && salaryRange !== 'Volunteer' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Compensation</p>
                    <span className="text-sm font-medium text-gray-700">{salaryRange}</span>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => openEditModal(staffMember)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-all duration-200"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(staffMember.id)}
                    disabled={deleting === staffMember.id}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-red-50 hover:border-red-200 text-red-600 transition-all duration-200 disabled:opacity-50"
                  >
                    {deleting === staffMember.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Remove
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={closeModal} />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="Pastor James Wilson"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title/Position</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="Senior Pastor"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                      placeholder="james@ministry.org"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    >
                      {DEPARTMENT_OPTIONS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                    <input
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                    <select
                      value={formData.salary_range}
                      onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    >
                      {SALARY_RANGE_OPTIONS.map(range => (
                        <option key={range} value={range}>{range}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className={cn(
                      'flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200',
                      classes.buttonPrimary,
                      'disabled:opacity-50'
                    )}
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingStaff ? 'Update' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
