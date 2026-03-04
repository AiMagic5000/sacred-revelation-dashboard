'use client'

import { useState } from 'react'
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Filter,
  Edit2,
  Trash2,
  X,
  Loader2,
  Download,
  UserCheck,
  Heart,
  Building2,
} from 'lucide-react'
import { getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { useMembers, MemberRecord } from '@/hooks/useData'
import { membersApi, CreateMemberData, UpdateMemberData } from '@/lib/api'

const ROLE_OPTIONS = ['Elder', 'Deacon', 'Trustee', 'Member', 'Visitor'] as const
type MemberRole = (typeof ROLE_OPTIONS)[number]

interface MemberFormData {
  name: string
  email: string
  phone: string
  role: MemberRole
  status: 'active' | 'inactive'
  family_size: string
  notes: string
}

const initialFormData: MemberFormData = {
  name: '',
  email: '',
  phone: '',
  role: 'Member',
  status: 'active',
  family_size: '1',
  notes: '',
}

function extractSkillTag(skills: string[], prefix: string): string {
  const tag = (skills || []).find(s => s.startsWith(`${prefix}:`))
  return tag ? tag.slice(prefix.length + 1) : ''
}

function getRoleBadge(role: string) {
  switch (role) {
    case 'Elder': return 'bg-purple-100 text-purple-800'
    case 'Deacon': return 'bg-blue-100 text-blue-800'
    case 'Trustee': return 'bg-indigo-100 text-indigo-800'
    case 'Member': return 'bg-green-100 text-green-800'
    case 'Visitor': return 'bg-amber-100 text-amber-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800'
    case 'inactive': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function MembersPage() {
  const classes = getThemeClasses('sacred')
  const { data: members, isLoading, mutate } = useMembers()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState<MemberRecord | null>(null)
  const [formData, setFormData] = useState<MemberFormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const membersList = members || []

  const filteredMembers = membersList.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    const memberRole = extractSkillTag(member.skills, 'role')
    const matchesRole = filterRole === 'all' || memberRole === filterRole
    return matchesSearch && matchesRole
  })

  const activeCount = membersList.filter(m => m.status === 'active').length
  const totalIndividuals = membersList.reduce((sum, m) => sum + (m.total_hours || 1), 0)
  const newThisMonth = membersList.filter(m => {
    const created = new Date(m.created_at)
    const now = new Date()
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
  }).length

  const openAddModal = () => {
    setEditingMember(null)
    setFormData(initialFormData)
    setShowModal(true)
  }

  const openEditModal = (member: MemberRecord) => {
    setEditingMember(member)
    setFormData({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      role: (extractSkillTag(member.skills, 'role') as MemberRole) || 'Member',
      status: member.status || 'active',
      family_size: (member.total_hours || 1).toString(),
      notes: extractSkillTag(member.skills, 'notes'),
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingMember(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload: CreateMemberData | UpdateMemberData = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        role: formData.role,
        status: formData.status,
        family_size: parseInt(formData.family_size) || 1,
        notes: formData.notes || undefined,
      }

      if (editingMember) {
        await membersApi.update(editingMember.id, payload as UpdateMemberData)
      } else {
        await membersApi.create(payload as CreateMemberData)
      }

      await mutate()
      closeModal()
    } catch (error) {
      alert('Failed to save member. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    setDeleting(id)
    try {
      await membersApi.delete(id)
      await mutate()
    } catch (error) {
      alert('Failed to delete member. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const handleExport = () => {
    if (!membersList.length) return

    const headers = ['Name', 'Email', 'Phone', 'Role', 'Status', 'Family Size', 'Joined Date']
    const rows = membersList.map(m => [
      m.name,
      m.email || '',
      m.phone || '',
      extractSkillTag(m.skills, 'role') || 'Member',
      m.status,
      (m.total_hours || 1).toString(),
      new Date(m.created_at).toLocaleDateString(),
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `members-${new Date().toISOString().split('T')[0]}.csv`
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
          <h1 className="text-2xl font-bold text-gray-900">Church Members</h1>
          <p className="text-gray-500 mt-1">
            Manage your congregation and ministry involvement
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
            <Plus className="w-5 h-5" />
            Add Member
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-md"
             style={{ animationDelay: '0ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Families/Households</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{membersList.length}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Building2 className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-md"
             style={{ animationDelay: '50ms' }}>
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

        <div className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-md"
             style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Members</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeCount}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <UserCheck className={cn('w-6 h-6', classes.textPrimary)} />
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-700"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-700"
            >
              <option value="all">All Roles</option>
              {ROLE_OPTIONS.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-gray-500 mt-4">No members found</p>
            <button
              onClick={openAddModal}
              className={cn('mt-4 px-4 py-2 rounded-lg font-medium', classes.buttonPrimary)}
            >
              Add First Member
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Member</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Family Size</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembers.map((member, index) => {
                  const role = extractSkillTag(member.skills, 'role') || 'Member'
                  return (
                    <tr key={member.id} className="hover:bg-gray-50 transition-all duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium',
                            classes.bgPrimary
                          )}>
                            {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-500">
                              Joined {new Date(member.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          getRoleBadge(role)
                        )}>
                          {role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{member.total_hours || 1}</span>
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
                          {member.email && (
                            <a
                              href={`mailto:${member.email}`}
                              className="p-2 text-gray-400 hover:text-purple-800 hover:bg-gray-100 rounded-lg transition-colors"
                              title={member.email}
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          )}
                          {member.phone && (
                            <a
                              href={`tel:${member.phone}`}
                              className="p-2 text-gray-400 hover:text-purple-800 hover:bg-gray-100 rounded-lg transition-colors"
                              title={member.phone}
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(member)}
                            className="p-1 text-gray-400 hover:text-purple-800 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(member.id)}
                            disabled={deleting === member.id}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deleting === member.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
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
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingMember ? 'Edit Member' : 'Add New Member'}
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
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="john@example.com"
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as MemberRole })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    >
                      {ROLE_OPTIONS.map(role => (
                        <option key={role} value={role}>{role}</option>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Family Size</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.family_size}
                    onChange={(e) => setFormData({ ...formData, family_size: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="Additional notes about this member..."
                  />
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
                    {editingMember ? 'Update' : 'Save'}
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
