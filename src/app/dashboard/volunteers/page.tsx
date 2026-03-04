'use client'

import { useState } from 'react'
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Calendar,
  Clock,
  Award,
  Filter,
  Edit2,
  Trash2,
  X,
  Loader2,
  Download,
} from 'lucide-react'
import { getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { useVolunteers, Volunteer } from '@/hooks/useData'
import { volunteersApi, CreateVolunteerData, UpdateVolunteerData } from '@/lib/api'

interface VolunteerFormData {
  name: string
  email: string
  phone: string
  skills: string
  status: 'active' | 'inactive'
  total_hours: string
}

const initialFormData: VolunteerFormData = {
  name: '',
  email: '',
  phone: '',
  skills: '',
  status: 'active',
  total_hours: '0',
}

export default function VolunteersPage() {
  const classes = getThemeClasses('sacred')
  const { data: volunteers, isLoading, mutate } = useVolunteers()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null)
  const [formData, setFormData] = useState<VolunteerFormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const volunteersList = volunteers || []

  const filteredVolunteers = volunteersList.filter((vol) => {
    const matchesSearch = vol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (vol.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    const matchesStatus = filterStatus === 'all' || vol.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const activeCount = volunteersList.filter(v => v.status === 'active').length
  const totalHours = volunteersList.reduce((sum, v) => sum + (v.total_hours || 0), 0)
  const pendingCount = volunteersList.filter(v => v.status === 'inactive').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const openAddModal = () => {
    setEditingVolunteer(null)
    setFormData(initialFormData)
    setShowModal(true)
  }

  const openEditModal = (volunteer: Volunteer) => {
    setEditingVolunteer(volunteer)
    setFormData({
      name: volunteer.name || '',
      email: volunteer.email || '',
      phone: volunteer.phone || '',
      skills: (volunteer.skills || []).join(', '),
      status: volunteer.status || 'active',
      total_hours: volunteer.total_hours?.toString() || '0',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingVolunteer(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const skillsArray = formData.skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)

      const data: CreateVolunteerData | UpdateVolunteerData = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        skills: skillsArray.length > 0 ? skillsArray : undefined,
        status: formData.status,
        total_hours: parseInt(formData.total_hours) || 0,
      }

      if (editingVolunteer) {
        await volunteersApi.update(editingVolunteer.id, data as UpdateVolunteerData)
      } else {
        await volunteersApi.create(data as CreateVolunteerData)
      }

      await mutate()
      closeModal()
    } catch (error) {
      console.error('Error saving volunteer:', error)
      alert('Failed to save volunteer. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this volunteer?')) return

    setDeleting(id)
    try {
      await volunteersApi.delete(id)
      await mutate()
    } catch (error) {
      console.error('Error deleting volunteer:', error)
      alert('Failed to delete volunteer. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const handleExport = () => {
    if (!volunteersList.length) return

    const headers = ['Name', 'Email', 'Phone', 'Skills', 'Status', 'Total Hours', 'Joined Date']
    const rows = volunteersList.map(v => [
      v.name,
      v.email || '',
      v.phone || '',
      (v.skills || []).join('; '),
      v.status,
      v.total_hours?.toString() || '0',
      new Date(v.created_at).toLocaleDateString(),
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `volunteers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
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
          <h1 className="text-2xl font-bold text-gray-900">Volunteers</h1>
          <p className="text-gray-500 mt-1">
            Manage your ministry's volunteer team
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={openAddModal}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
              classes.buttonPrimary
            )}
          >
            <Plus className="w-5 h-5" />
            Add Volunteer
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Volunteers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{volunteersList.length}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Users className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Volunteers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeCount}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Calendar className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalHours}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Clock className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Inactive</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{pendingCount}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Award className={cn('w-6 h-6', classes.textPrimary)} />
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
              placeholder="Search volunteers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-700"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-700"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Volunteers Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredVolunteers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-gray-500 mt-4">No volunteers found</p>
            <button
              onClick={openAddModal}
              className={cn('mt-4 px-4 py-2 rounded-lg font-medium', classes.buttonPrimary)}
            >
              Add First Volunteer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Volunteer</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Skills</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total Hours</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVolunteers.map((volunteer) => (
                  <tr key={volunteer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium',
                          classes.bgPrimary
                        )}>
                          {volunteer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{volunteer.name}</p>
                          <p className="text-sm text-gray-500">
                            Joined {new Date(volunteer.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(volunteer.skills || []).slice(0, 3).map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                            {skill}
                          </span>
                        ))}
                        {(volunteer.skills || []).length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{(volunteer.skills || []).length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full capitalize',
                        getStatusBadge(volunteer.status)
                      )}>
                        {volunteer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{volunteer.total_hours || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {volunteer.email && (
                          <a
                            href={`mailto:${volunteer.email}`}
                            className="p-2 text-gray-400 hover:text-purple-800 hover:bg-gray-100 rounded-lg transition-colors"
                            title={volunteer.email}
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                        {volunteer.phone && (
                          <a
                            href={`tel:${volunteer.phone}`}
                            className="p-2 text-gray-400 hover:text-purple-800 hover:bg-gray-100 rounded-lg transition-colors"
                            title={volunteer.phone}
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(volunteer)}
                          className="p-1 text-gray-400 hover:text-purple-800 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(volunteer.id)}
                          disabled={deleting === volunteer.id}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === volunteer.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={closeModal} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingVolunteer ? 'Edit Volunteer' : 'Add New Volunteer'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="Farming, Driving, Organization"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Hours
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.total_hours}
                      onChange={(e) => setFormData({ ...formData, total_hours: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className={cn(
                      'flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2',
                      classes.buttonPrimary,
                      'disabled:opacity-50'
                    )}
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingVolunteer ? 'Update' : 'Save'}
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
