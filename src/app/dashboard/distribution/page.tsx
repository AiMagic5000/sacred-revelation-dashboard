'use client'

import { useState } from 'react'
import {
  Truck,
  Plus,
  Users,
  Package,
  MapPin,
  Calendar,
  TrendingUp,
  Edit2,
  Trash2,
  X,
  Loader2,
  Download,
} from 'lucide-react'
import { getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { useDistribution, DistributionRecord } from '@/hooks/useData'
import { distributionApi, CreateDistributionData, UpdateDistributionData } from '@/lib/api'

interface DistributionFormData {
  recipient_name: string
  recipient_contact: string
  items_distributed: string
  quantity: string
  distribution_date: string
  location: string
  notes: string
}

const initialFormData: DistributionFormData = {
  recipient_name: '',
  recipient_contact: '',
  items_distributed: '',
  quantity: '',
  distribution_date: new Date().toISOString().split('T')[0],
  location: '',
  notes: '',
}

export default function DistributionPage() {
  const classes = getThemeClasses('sacred')
  const { data: distributions, isLoading, mutate } = useDistribution()

  const [showModal, setShowModal] = useState(false)
  const [editingDistribution, setEditingDistribution] = useState<DistributionRecord | null>(null)
  const [formData, setFormData] = useState<DistributionFormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const distributionsList = distributions || []
  const totalQuantity = distributionsList.reduce((sum, d) => sum + (d.quantity || 0), 0)

  const openAddModal = () => {
    setEditingDistribution(null)
    setFormData(initialFormData)
    setShowModal(true)
  }

  const openEditModal = (dist: DistributionRecord) => {
    setEditingDistribution(dist)
    setFormData({
      recipient_name: dist.recipient_name || '',
      recipient_contact: dist.recipient_contact || '',
      items_distributed: dist.items_distributed || '',
      quantity: dist.quantity?.toString() || '',
      distribution_date: dist.distribution_date?.split('T')[0] || '',
      location: dist.location || '',
      notes: dist.notes || '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingDistribution(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const data: CreateDistributionData | UpdateDistributionData = {
        recipient_name: formData.recipient_name,
        recipient_contact: formData.recipient_contact || undefined,
        items_distributed: formData.items_distributed,
        quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
        distribution_date: formData.distribution_date,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
      }

      if (editingDistribution) {
        await distributionApi.update(editingDistribution.id, data as UpdateDistributionData)
      } else {
        await distributionApi.create(data as CreateDistributionData)
      }

      await mutate()
      closeModal()
    } catch (error) {
      console.error('Error saving distribution:', error)
      alert('Failed to save distribution. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this distribution record?')) return

    setDeleting(id)
    try {
      await distributionApi.delete(id)
      await mutate()
    } catch (error) {
      console.error('Error deleting distribution:', error)
      alert('Failed to delete distribution. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const handleExport = () => {
    if (!distributionsList.length) return

    const headers = ['Recipient', 'Contact', 'Items', 'Quantity', 'Date', 'Location', 'Notes']
    const rows = distributionsList.map(d => [
      d.recipient_name,
      d.recipient_contact || '',
      d.items_distributed,
      d.quantity?.toString() || '',
      d.distribution_date,
      d.location || '',
      d.notes || '',
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `distributions-${new Date().toISOString().split('T')[0]}.csv`
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
          <h1 className="text-2xl font-bold text-gray-900">Food Distribution</h1>
          <p className="text-gray-500 mt-1">
            Track distributions and families served through your ministry
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
            Record Distribution
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Distributions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{distributionsList.length}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Truck className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Quantity</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalQuantity.toLocaleString()}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Package className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Recipients</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {new Set(distributionsList.map(d => d.recipient_name)).size}
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
              <p className="text-sm text-gray-500">Locations</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {new Set(distributionsList.filter(d => d.location).map(d => d.location)).size}
              </p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <MapPin className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Distribution History</h2>
          <span className="text-sm text-gray-500">{distributionsList.length} records</span>
        </div>

        {distributionsList.length === 0 ? (
          <div className="p-8 text-center">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No distributions recorded yet</p>
            <button
              onClick={openAddModal}
              className={cn('mt-4 px-4 py-2 rounded-lg font-medium', classes.buttonPrimary)}
            >
              Record First Distribution
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Recipient</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {distributionsList.map((dist) => (
                  <tr key={dist.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(dist.distribution_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{dist.recipient_name}</p>
                        {dist.recipient_contact && (
                          <p className="text-xs text-gray-500">{dist.recipient_contact}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{dist.items_distributed}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {dist.quantity?.toLocaleString() || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {dist.location && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-4 h-4" />
                          {dist.location}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(dist)}
                          className="p-1 text-gray-400 hover:text-purple-800 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(dist.id)}
                          disabled={deleting === dist.id}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === dist.id ? (
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
                  {editingDistribution ? 'Edit Distribution' : 'Record New Distribution'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.recipient_name}
                    onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="Family or organization name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Info
                  </label>
                  <input
                    type="text"
                    value={formData.recipient_contact}
                    onChange={(e) => setFormData({ ...formData, recipient_contact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="Phone or email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Items Distributed *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.items_distributed}
                    onChange={(e) => setFormData({ ...formData, items_distributed: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="Fresh produce, canned goods, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity (lbs)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.distribution_date}
                      onChange={(e) => setFormData({ ...formData, distribution_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="Distribution location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="Additional notes..."
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
                    className={cn(
                      'flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2',
                      classes.buttonPrimary,
                      'disabled:opacity-50'
                    )}
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingDistribution ? 'Update' : 'Save'}
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
