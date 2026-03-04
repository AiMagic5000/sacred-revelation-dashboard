'use client'

import { useState } from 'react'
import {
  Heart,
  Plus,
  MapPin,
  Phone,
  Mail,
  Globe,
  Package,
  Calendar,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  Loader2,
  Download,
  Search,
} from 'lucide-react'
import { getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { usePartners, Partner } from '@/hooks/useData'
import { partnersApi, CreatePartnerData, UpdatePartnerData } from '@/lib/api'

interface PartnerFormData {
  name: string
  email: string
  phone: string
  role: string
  status: 'active' | 'inactive'
}

const initialFormData: PartnerFormData = {
  name: '',
  email: '',
  phone: '',
  role: 'church',
  status: 'active',
}

export default function PartnersPage() {
  const classes = getThemeClasses('sacred')
  const { data: partners, isLoading, mutate } = usePartners()

  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [formData, setFormData] = useState<PartnerFormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const partnersList = partners || []

  const filteredPartners = partnersList.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    (p.role?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  )

  const activePartners = partnersList.filter(p => p.status === 'active').length
  const churchPartners = partnersList.filter(p => p.role === 'church' || p.role === 'Church').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleBadge = (role: string | undefined) => {
    const r = role?.toLowerCase()
    switch (r) {
      case 'church': return 'bg-purple-100 text-purple-800'
      case 'nonprofit': return 'bg-blue-100 text-blue-800'
      case 'business': return 'bg-green-100 text-green-800'
      case 'government': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const openAddModal = () => {
    setEditingPartner(null)
    setFormData(initialFormData)
    setShowModal(true)
  }

  const openEditModal = (partner: Partner) => {
    setEditingPartner(partner)
    setFormData({
      name: partner.name || '',
      email: partner.email || '',
      phone: partner.phone || '',
      role: partner.role || 'church',
      status: partner.status || 'active',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingPartner(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const data: CreatePartnerData | UpdatePartnerData = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        role: formData.role,
        status: formData.status,
      }

      if (editingPartner) {
        await partnersApi.update(editingPartner.id, data as UpdatePartnerData)
      } else {
        await partnersApi.create(data as CreatePartnerData)
      }

      await mutate()
      closeModal()
    } catch (error) {
      console.error('Error saving partner:', error)
      alert('Failed to save partner. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this partner?')) return

    setDeleting(id)
    try {
      await partnersApi.delete(id)
      await mutate()
    } catch (error) {
      console.error('Error deleting partner:', error)
      alert('Failed to delete partner. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const handleExport = () => {
    if (!partnersList.length) return

    const headers = ['Name', 'Email', 'Phone', 'Role', 'Status', 'Joined Date']
    const rows = partnersList.map(p => [
      p.name,
      p.email || '',
      p.phone || '',
      p.role || '',
      p.status,
      new Date(p.created_at).toLocaleDateString(),
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `partners-${new Date().toISOString().split('T')[0]}.csv`
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
          <h1 className="text-2xl font-bold text-gray-900">Partner Churches & Organizations</h1>
          <p className="text-gray-500 mt-1">
            Manage partnerships that extend your ministry's reach
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={openAddModal}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
              classes.buttonPrimary
            )}
          >
            <Plus className="w-5 h-5" />
            Add Partner
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Partners</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{partnersList.length}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Heart className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Partners</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activePartners}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Calendar className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Churches</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{churchPartners}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Heart className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Organizations</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {partnersList.length - churchPartners}
              </p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Package className={cn('w-6 h-6', classes.textPrimary)} />
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
            placeholder="Search partners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-700"
          />
        </div>
      </div>

      {/* Partners Grid */}
      {filteredPartners.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No partners found</p>
          <button
            onClick={openAddModal}
            className={cn('mt-4 px-4 py-2 rounded-lg font-medium', classes.buttonPrimary)}
          >
            Add First Partner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => (
            <div key={partner.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {partner.role && (
                        <span className={cn(
                          'px-2 py-0.5 text-xs font-medium rounded-full capitalize',
                          getRoleBadge(partner.role)
                        )}>
                          {partner.role}
                        </span>
                      )}
                      <span className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded-full capitalize',
                        getStatusBadge(partner.status)
                      )}>
                        {partner.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(partner)}
                      className="p-1 text-gray-400 hover:text-purple-800 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(partner.id)}
                      disabled={deleting === partner.id}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deleting === partner.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {partner.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${partner.email}`} className="hover:text-purple-800">
                        {partner.email}
                      </a>
                    </div>
                  )}
                  {partner.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${partner.phone}`} className="hover:text-purple-800">
                        {partner.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Added: {new Date(partner.created_at).toLocaleDateString()}</span>
                  <span>Updated: {new Date(partner.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={closeModal} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingPartner ? 'Edit Partner' : 'Add New Partner'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="First Baptist Church"
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
                    placeholder="contact@church.org"
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    >
                      <option value="church">Church</option>
                      <option value="nonprofit">Nonprofit</option>
                      <option value="business">Business</option>
                      <option value="government">Government</option>
                    </select>
                  </div>

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
                    {editingPartner ? 'Update' : 'Save'}
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
