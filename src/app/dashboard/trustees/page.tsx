'use client'

import { useState } from 'react'
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit2,
  Trash2,
  X,
  Loader2,
  Download,
  AlertTriangle,
  CheckCircle2,
  FileSignature,
  Filter,
} from 'lucide-react'
import { getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { useTrustees, TrusteeRecord } from '@/hooks/useData'
import { trusteesApi, CreateTrusteeData, UpdateTrusteeData } from '@/lib/api'

const TRUSTEE_ROLE_OPTIONS = [
  'Grantor',
  'Trustee',
  'Beneficiary',
  'Successor Trustee',
] as const
type TrusteeRole = (typeof TRUSTEE_ROLE_OPTIONS)[number]

interface TrusteeFormData {
  name: string
  email: string
  phone: string
  role: TrusteeRole
  appointment_date: string
  term_expires: string
  responsibilities: string
  signature_on_file: boolean
  status: 'active' | 'inactive'
}

const initialFormData: TrusteeFormData = {
  name: '',
  email: '',
  phone: '',
  role: 'Trustee',
  appointment_date: '',
  term_expires: '',
  responsibilities: '',
  signature_on_file: false,
  status: 'active',
}

function extractSkillTag(skills: string[], prefix: string): string {
  const tag = (skills || []).find(s => s.startsWith(`${prefix}:`))
  return tag ? tag.slice(prefix.length + 1) : ''
}

function hasSkillTag(skills: string[], tag: string): boolean {
  return (skills || []).includes(tag)
}

function getRoleBadge(role: string) {
  switch (role) {
    case 'Grantor': return 'bg-purple-100 text-purple-800'
    case 'Trustee': return 'bg-blue-100 text-blue-800'
    case 'Beneficiary': return 'bg-green-100 text-green-800'
    case 'Successor Trustee': return 'bg-amber-100 text-amber-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getRoleDescription(role: string): string {
  switch (role) {
    case 'Grantor': return 'Creator of the trust - Required for 508(c)(1)(A)'
    case 'Trustee': return 'Manages trust assets and operations - Required'
    case 'Beneficiary': return 'Benefits from the trust activities - Required'
    case 'Successor Trustee': return 'Assumes duties if primary trustee cannot serve'
    default: return ''
  }
}

const REQUIRED_ROLES = ['Grantor', 'Trustee', 'Beneficiary']

export default function TrusteesPage() {
  const classes = getThemeClasses('sacred')
  const { data: trustees, isLoading, mutate } = useTrustees()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingTrustee, setEditingTrustee] = useState<TrusteeRecord | null>(null)
  const [formData, setFormData] = useState<TrusteeFormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const trusteesList = trustees || []

  const filteredTrustees = trusteesList.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    const trusteeRole = extractSkillTag(t.skills, 'role')
    const matchesRole = filterRole === 'all' || trusteeRole === filterRole
    return matchesSearch && matchesRole
  })

  const activeCount = trusteesList.filter(t => t.status === 'active').length
  const officerCount = trusteesList.filter(t => {
    const role = extractSkillTag(t.skills, 'role')
    return role !== 'Trustee' && role !== ''
  }).length

  // Check compliance - which required roles are filled
  const filledRoles = trusteesList.map(t => extractSkillTag(t.skills, 'role'))
  const missingRoles = REQUIRED_ROLES.filter(role => !filledRoles.includes(role))
  const isCompliant = missingRoles.length === 0

  // Count terms expiring within 6 months
  const sixMonthsFromNow = new Date()
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)
  const expiringCount = trusteesList.filter(t => {
    const expires = extractSkillTag(t.skills, 'expires')
    if (!expires) return false
    const expiryDate = new Date(expires)
    return expiryDate <= sixMonthsFromNow && expiryDate >= new Date()
  }).length

  const openAddModal = () => {
    setEditingTrustee(null)
    setFormData(initialFormData)
    setShowModal(true)
  }

  const openEditModal = (trustee: TrusteeRecord) => {
    setEditingTrustee(trustee)
    setFormData({
      name: trustee.name || '',
      email: trustee.email || '',
      phone: trustee.phone || '',
      role: (extractSkillTag(trustee.skills, 'role') as TrusteeRole) || 'Trustee',
      appointment_date: extractSkillTag(trustee.skills, 'appointed'),
      term_expires: extractSkillTag(trustee.skills, 'expires'),
      responsibilities: extractSkillTag(trustee.skills, 'resp'),
      signature_on_file: hasSkillTag(trustee.skills, 'sig:yes'),
      status: trustee.status || 'active',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingTrustee(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload: CreateTrusteeData | UpdateTrusteeData = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        role: formData.role,
        appointment_date: formData.appointment_date || undefined,
        term_expires: formData.term_expires || undefined,
        responsibilities: formData.responsibilities || undefined,
        signature_on_file: formData.signature_on_file,
        status: formData.status,
      }

      if (editingTrustee) {
        await trusteesApi.update(editingTrustee.id, payload as UpdateTrusteeData)
      } else {
        await trusteesApi.create(payload as CreateTrusteeData)
      }

      await mutate()
      closeModal()
    } catch (error) {
      alert('Failed to save trustee. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this trustee? This may affect your 508(c)(1)(A) compliance status.')) return

    setDeleting(id)
    try {
      await trusteesApi.delete(id)
      await mutate()
    } catch (error) {
      alert('Failed to delete trustee. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const handleExport = () => {
    if (!trusteesList.length) return

    const headers = ['Name', 'Email', 'Phone', 'Role', 'Status', 'Appointed', 'Term Expires', 'Responsibilities', 'Signature on File']
    const rows = trusteesList.map(t => [
      t.name,
      t.email || '',
      t.phone || '',
      extractSkillTag(t.skills, 'role') || 'Trustee',
      t.status,
      extractSkillTag(t.skills, 'appointed'),
      extractSkillTag(t.skills, 'expires'),
      extractSkillTag(t.skills, 'resp'),
      hasSkillTag(t.skills, 'sig:yes') ? 'Yes' : 'No',
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trustees-${new Date().toISOString().split('T')[0]}.csv`
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
          <h1 className="text-2xl font-bold text-gray-900">Board of Trustees</h1>
          <p className="text-gray-500 mt-1">
            Manage your ministry's governing board members
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
            Add Trustee
          </button>
        </div>
      </div>

      {/* Compliance Alert */}
      {!isCompliant && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-800">508(c)(1)(A) Compliance Warning</h3>
            <p className="text-sm text-amber-700 mt-1">
              Missing required trust positions: {missingRoles.join(', ')}.
              A valid 508(c)(1)(A) ministry trust requires a Grantor, Trustee, and Beneficiary.
            </p>
          </div>
        </div>
      )}

      {isCompliant && trusteesList.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-green-800">Trust Structure Complete</h3>
            <p className="text-sm text-green-700 mt-1">
              All required 508(c)(1)(A) trust positions are filled: Grantor, Trustee, and Beneficiary.
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-md"
             style={{ animationDelay: '0ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Trustees</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{trusteesList.length}</p>
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
              <p className="text-sm text-gray-500">Active Members</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeCount}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Shield className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-md"
             style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Officers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{officerCount}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <FileSignature className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-md"
             style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Terms Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{expiringCount}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Calendar className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>
      </div>

      {/* Trust Hierarchy */}
      {trusteesList.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Trust Structure</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {TRUSTEE_ROLE_OPTIONS.map(role => {
              const holders = trusteesList.filter(t => extractSkillTag(t.skills, 'role') === role)
              const isRequired = REQUIRED_ROLES.includes(role)
              const isFilled = holders.length > 0
              return (
                <div
                  key={role}
                  className={cn(
                    'p-4 rounded-xl border-2 text-center transition-all duration-200',
                    isFilled ? 'border-green-200 bg-green-50' : isRequired ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                  )}
                >
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {isFilled ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : isRequired ? (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    ) : null}
                    <span className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      getRoleBadge(role)
                    )}>
                      {role}
                    </span>
                  </div>
                  {holders.length > 0 ? (
                    <div className="space-y-1">
                      {holders.map(h => (
                        <p key={h.id} className="text-sm font-medium text-gray-900">{h.name}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      {isRequired ? 'Required - Not assigned' : 'Not assigned'}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search trustees..."
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
              {TRUSTEE_ROLE_OPTIONS.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Trustees Grid */}
      {filteredTrustees.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trustees found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || filterRole !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Add your first trustee to establish your trust structure'}
          </p>
          {searchQuery || filterRole !== 'all' ? (
            <button
              onClick={() => { setSearchQuery(''); setFilterRole('all') }}
              className="text-purple-700 hover:text-purple-800 font-medium"
            >
              Clear filters
            </button>
          ) : (
            <button
              onClick={openAddModal}
              className={cn('px-4 py-2 rounded-lg font-medium', classes.buttonPrimary)}
            >
              Add First Trustee
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrustees.map((trustee, index) => {
            const role = extractSkillTag(trustee.skills, 'role') || 'Trustee'
            const appointedDate = extractSkillTag(trustee.skills, 'appointed')
            const termExpires = extractSkillTag(trustee.skills, 'expires')
            const responsibilities = extractSkillTag(trustee.skills, 'resp')
            const hasSig = hasSkillTag(trustee.skills, 'sig:yes')

            return (
              <div
                key={trustee.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-lg',
                        classes.bgPrimary
                      )}>
                        {trustee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{trustee.name}</h3>
                        <span className={cn(
                          'inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1',
                          getRoleBadge(role)
                        )}>
                          {role}
                        </span>
                        <span className={cn(
                          'inline-block ml-2 px-2 py-0.5 text-xs font-medium rounded-full mt-1',
                          trustee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        )}>
                          {trustee.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-2 italic">
                    {getRoleDescription(role)}
                  </p>

                  <div className="mt-4 space-y-2 text-sm">
                    {trustee.email && (
                      <a href={`mailto:${trustee.email}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {trustee.email}
                      </a>
                    )}
                    {trustee.phone && (
                      <a href={`tel:${trustee.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {trustee.phone}
                      </a>
                    )}
                  </div>

                  {responsibilities && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">Responsibilities</p>
                      <div className="flex flex-wrap gap-1">
                        {responsibilities.split(',').map((resp, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                          >
                            {resp.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
                    {hasSig && (
                      <div className="flex items-center gap-1 text-green-600">
                        <FileSignature className="w-3.5 h-3.5" />
                        Signature on file
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{appointedDate ? `Appointed: ${appointedDate}` : 'No appointment date'}</span>
                    <span>{termExpires ? `Expires: ${termExpires}` : 'No expiry set'}</span>
                  </div>
                </div>

                <div className="px-6 py-3 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => openEditModal(trustee)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-all duration-200"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(trustee.id)}
                    disabled={deleting === trustee.id}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-red-50 hover:border-red-200 text-red-600 transition-all duration-200 disabled:opacity-50"
                  >
                    {deleting === trustee.id ? (
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
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingTrustee ? 'Edit Trustee' : 'Add New Trustee'}
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
                    placeholder="Pastor David Thompson"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trust Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as TrusteeRole })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                  >
                    {TRUSTEE_ROLE_OPTIONS.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {getRoleDescription(formData.role)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                      placeholder="email@ministry.org"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date</label>
                    <input
                      type="date"
                      value={formData.appointment_date}
                      onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Term Expires</label>
                    <input
                      type="date"
                      value={formData.term_expires}
                      onChange={(e) => setFormData({ ...formData, term_expires: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    />
                  </div>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsibilities (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.responsibilities}
                    onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="Spiritual Leadership, Ministry Vision, Board Meetings"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="sig-on-file"
                    checked={formData.signature_on_file}
                    onChange={(e) => setFormData({ ...formData, signature_on_file: e.target.checked })}
                    className="w-4 h-4 text-purple-700 border-gray-300 rounded focus:ring-purple-700"
                  />
                  <label htmlFor="sig-on-file" className="text-sm font-medium text-gray-700">
                    Signature on file
                  </label>
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
                    {editingTrustee ? 'Update' : 'Save'}
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
