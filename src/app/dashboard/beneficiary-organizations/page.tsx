'use client'

import { useState } from 'react'
import {
  Heart,
  Plus,
  Search,
  Download,
  Globe,
  Mail,
  Phone,
  Filter,
  Edit2,
  Trash2,
  X,
  Loader2,
  Building2,
  DollarSign,
  Calendar,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBeneficiaryOrgs, BeneficiaryOrganization, BeneficiaryCategory } from '@/hooks/useData'
import { beneficiaryOrgsApi, CreateBeneficiaryOrgData, UpdateBeneficiaryOrgData } from '@/lib/api'

const CATEGORIES = [
  'Humanitarian',
  'Veterans',
  'Faith-Based',
  'Children',
  'Native Communities',
  'Anti-Trafficking',
] as const

const SAMPLE_ORGS = [
  'AmishHeritage.org', 'GreatNeeds.org', 'Food for the Hungry', 'Save the Children',
  'World Vision', 'Relief International', 'IRC', 'Feed the Children',
  'Wounded Warrior Project', 'Disabled American Veterans', 'CBN',
  'Matthew 25 Ministries', 'HerShelter.com', 'BridgeNorth.org',
  'Jubilee Foundation of Israel', 'Blue Skies Foundation', 'Joyful Heart Foundation',
  'Faith Foundation Corp', 'ILLLI.org', 'Help.rescue.org', 'Compassion International',
  'The Nurturing Network', 'DeepBeliever Ministry', 'AmandaGrace Ministries',
  'KOGCN.org', "Our Father's House", 'Loaves and Fishes Ministry',
]

interface FormData {
  name: string
  website_url: string
  category: BeneficiaryCategory
  contact_email: string
  contact_phone: string
  notes: string
  status: 'active' | 'inactive'
}

const initialFormData: FormData = {
  name: '',
  website_url: '',
  category: 'Humanitarian',
  contact_email: '',
  contact_phone: '',
  notes: '',
  status: 'active',
}

export default function BeneficiaryOrganizationsPage() {
  const { data: orgs, isLoading, mutate } = useBeneficiaryOrgs()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingOrg, setEditingOrg] = useState<BeneficiaryOrganization | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const orgsList = orgs || []

  const filteredOrgs = orgsList.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (org.category?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    const matchesCategory = filterCategory === 'all' || org.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const activeOrgs = orgsList.filter((o) => o.status === 'active').length
  const totalDistributed = orgsList.reduce((sum, o) => sum + (o.total_distributed || 0), 0)
  const categoryCounts = CATEGORIES.map((cat) => ({
    name: cat,
    count: orgsList.filter((o) => o.category === cat).length,
  }))

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Humanitarian': return 'bg-purple-100 text-purple-800'
      case 'Veterans': return 'bg-blue-100 text-blue-800'
      case 'Faith-Based': return 'bg-amber-100 text-amber-800'
      case 'Children': return 'bg-pink-100 text-pink-800'
      case 'Native Communities': return 'bg-green-100 text-green-800'
      case 'Anti-Trafficking': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const openAddModal = () => {
    setEditingOrg(null)
    setFormData(initialFormData)
    setShowModal(true)
  }

  const openEditModal = (org: BeneficiaryOrganization) => {
    setEditingOrg(org)
    setFormData({
      name: org.name || '',
      website_url: org.website_url || '',
      category: org.category || 'Humanitarian',
      contact_email: org.contact_email || '',
      contact_phone: org.contact_phone || '',
      notes: org.notes || '',
      status: org.status || 'active',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingOrg(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload: CreateBeneficiaryOrgData | UpdateBeneficiaryOrgData = {
        name: formData.name,
        website_url: formData.website_url || undefined,
        category: formData.category,
        contact_email: formData.contact_email || undefined,
        contact_phone: formData.contact_phone || undefined,
        notes: formData.notes || undefined,
        status: formData.status,
      }

      if (editingOrg) {
        await beneficiaryOrgsApi.update(editingOrg.id, payload as UpdateBeneficiaryOrgData)
      } else {
        await beneficiaryOrgsApi.create(payload as CreateBeneficiaryOrgData)
      }

      await mutate()
      closeModal()
    } catch (error) {
      console.error('Error saving organization:', error)
      alert('Failed to save organization. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this beneficiary organization?')) return

    setDeleting(id)
    try {
      await beneficiaryOrgsApi.delete(id)
      await mutate()
    } catch (error) {
      console.error('Error deleting organization:', error)
      alert('Failed to delete organization. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const handleExport = () => {
    if (!orgsList.length) return

    const headers = ['Name', 'Category', 'Website', 'Email', 'Phone', 'Status', 'Total Distributed', 'Last Distribution', 'Notes']
    const rows = orgsList.map((o) => [
      o.name,
      o.category || '',
      o.website_url || '',
      o.contact_email || '',
      o.contact_phone || '',
      o.status,
      String(o.total_distributed || 0),
      o.last_distribution_date || '',
      o.notes || '',
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `beneficiary-organizations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Beneficiary Organizations</h1>
          <p className="text-gray-500 mt-1">
            Manage the 28 designated charitable beneficiary organizations
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
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-purple-500 hover:bg-purple-600 text-white"
          >
            <Plus className="w-5 h-5" />
            Add Organization
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Organizations</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{orgsList.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Partnerships</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeOrgs}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <CheckCircle2 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Distributed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${totalDistributed.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{CATEGORIES.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCategory('all')}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            filterCategory === 'all'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          All ({orgsList.length})
        </button>
        {categoryCounts.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setFilterCategory(cat.name)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              filterCategory === cat.name
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {cat.name} ({cat.count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search organizations by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Table */}
      {filteredOrgs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Heart className="w-16 h-16 text-purple-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Beneficiary Organizations Yet</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-2">
            Add your designated charitable beneficiary organizations to track distributions and partnerships.
          </p>
          <p className="text-sm text-gray-400 mb-6 max-w-lg mx-auto">
            Sacred Revelation Ministry Trust supports 28 organizations including: {SAMPLE_ORGS.slice(0, 8).join(', ')}, and {SAMPLE_ORGS.length - 8} more.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-lg font-medium bg-purple-500 hover:bg-purple-600 text-white"
          >
            Add First Organization
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Organization</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Website</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Last Distribution</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrgs.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium text-sm">
                          {org.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{org.name}</p>
                          {org.contact_email && (
                            <p className="text-sm text-gray-500">{org.contact_email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        getCategoryBadge(org.category || '')
                      )}>
                        {org.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {org.website_url ? (
                        <a
                          href={org.website_url.startsWith('http') ? org.website_url : `https://${org.website_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-purple-600 hover:text-purple-800 text-sm"
                        >
                          <Globe className="w-4 h-4" />
                          Visit
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full capitalize',
                        org.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      )}>
                        {org.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {org.last_distribution_date
                        ? new Date(org.last_distribution_date).toLocaleDateString()
                        : '--'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(org)}
                          className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(org.id)}
                          disabled={deleting === org.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 rounded"
                          title="Delete"
                        >
                          {deleting === org.id ? (
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
        </div>
      )}

      {/* Category Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoryCounts.map((cat) => (
            <div key={cat.name} className="p-4 bg-purple-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-700">{cat.count}</p>
              <p className="text-xs text-purple-600 mt-1">{cat.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={closeModal} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingOrg ? 'Edit Organization' : 'Add Beneficiary Organization'}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Save the Children"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://www.example.org"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as BeneficiaryCategory })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="contact@org.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="Additional details about this partnership..."
                  />
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
                    className="flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingOrg ? 'Update' : 'Save'}
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
