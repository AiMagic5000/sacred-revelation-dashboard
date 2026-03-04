'use client'

import { useState } from 'react'
import {
  Wheat,
  Plus,
  Search,
  Download,
  Edit2,
  Trash2,
  X,
  Loader2,
  Package,
  Calendar,
  Activity,
  LayoutGrid,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getThemeClasses } from '@/lib/themes'
import { useProduction, ProductionRecord } from '@/hooks/useData'
import { productionApi, CreateProductionData, UpdateProductionData } from '@/lib/api'

const classes = getThemeClasses('sacred')

interface FoodFormData {
  title: string
  description: string
  quantity: string
  unit: string
  production_date: string
  notes: string
}

const emptyForm: FoodFormData = {
  title: '',
  description: '',
  quantity: '',
  unit: '',
  production_date: new Date().toISOString().split('T')[0],
  notes: '',
}

export default function FoodMinistryPage() {
  const { data: records, isLoading, mutate } = useProduction('food')

  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ProductionRecord | null>(null)
  const [formData, setFormData] = useState<FoodFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const list: ProductionRecord[] = records || []

  const filtered = list.filter((r) => {
    const q = searchQuery.toLowerCase()
    return (
      r.title.toLowerCase().includes(q) ||
      (r.description?.toLowerCase().includes(q) ?? false) ||
      (r.unit?.toLowerCase().includes(q) ?? false) ||
      (r.notes?.toLowerCase().includes(q) ?? false)
    )
  })

  const totalItems = list.length
  const totalQuantity = list.reduce((sum, r) => sum + (r.quantity || 0), 0)

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentActivity = list.filter(
    (r) => new Date(r.production_date) >= thirtyDaysAgo
  ).length

  const uniqueCategories = new Set(list.map((r) => r.title)).size

  const openAddModal = () => {
    setEditingRecord(null)
    setFormData(emptyForm)
    setShowModal(true)
  }

  const openEditModal = (r: ProductionRecord) => {
    setEditingRecord(r)
    setFormData({
      title: r.title || '',
      description: r.description || '',
      quantity: r.quantity != null ? String(r.quantity) : '',
      unit: r.unit || '',
      production_date: r.production_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      notes: r.notes || '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingRecord(null)
    setFormData(emptyForm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const quantityValue = formData.quantity !== '' ? parseFloat(formData.quantity) : undefined

      if (editingRecord) {
        const payload: UpdateProductionData = {
          title: formData.title,
          description: formData.description || undefined,
          quantity: quantityValue,
          unit: formData.unit || undefined,
          production_date: formData.production_date,
          notes: formData.notes || undefined,
        }
        await productionApi.update(editingRecord.id, payload)
      } else {
        const payload: CreateProductionData = {
          record_type: 'food',
          title: formData.title,
          description: formData.description || undefined,
          quantity: quantityValue,
          unit: formData.unit || undefined,
          production_date: formData.production_date,
          notes: formData.notes || undefined,
        }
        await productionApi.create(payload)
      }

      await mutate()
      closeModal()
    } catch (err) {
      console.error('Error saving food record:', err)
      alert('Failed to save record. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    setShowDeleteConfirm(null)
    try {
      await productionApi.delete(id)
      await mutate()
    } catch (err) {
      console.error('Error deleting food record:', err)
      alert('Failed to delete record. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const handleExport = () => {
    if (!list.length) return
    const headers = ['Item', 'Description', 'Quantity', 'Unit', 'Production Date', 'Notes']
    const rows = list.map((r) => [
      r.title,
      r.description || '',
      r.quantity != null ? String(r.quantity) : '',
      r.unit || '',
      new Date(r.production_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      r.notes || '',
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `food-ministry-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-700" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className={cn('p-2 rounded-lg', classes.bgLight)}>
              <Wheat className={cn('w-5 h-5', classes.textPrimary)} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Food Ministry</h1>
          </div>
          <p className="text-gray-500 ml-11 text-sm">
            Track food preparation, distribution, and pantry operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={list.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={openAddModal}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm',
              classes.buttonPrimary
            )}
          >
            <Plus className="w-4 h-4" />
            Add Record
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalItems}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Package className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Quantity</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalQuantity.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Units across all records</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Wheat className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Recent Activity</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{recentActivity}</p>
              <p className="text-xs text-gray-400 mt-0.5">Records in last 30 days</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Unique Categories</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{uniqueCategories}</p>
              <p className="text-xs text-gray-400 mt-0.5">Distinct item types</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <LayoutGrid className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by item name, description, or unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table or Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className={cn('inline-flex p-4 rounded-full mb-4', classes.bgLight)}>
            <Wheat className={cn('w-10 h-10', classes.textPrimary)} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No records match your search' : 'No food ministry records yet'}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6 text-sm">
            {searchQuery
              ? 'Try adjusting your search terms.'
              : 'Start logging food preparation, meal kits, pantry items, and distribution records for your food ministry.'}
          </p>
          {!searchQuery && (
            <button
              onClick={openAddModal}
              className={cn('px-5 py-2 rounded-lg font-medium text-sm', classes.buttonPrimary)}
            >
              Add First Record
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Production Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Wheat className={cn('w-4 h-4 shrink-0', classes.textPrimary)} />
                        <span className="text-sm font-medium text-gray-900">{r.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      {r.description ? (
                        <span className="truncate block max-w-[200px]">{r.description}</span>
                      ) : (
                        <span className="text-gray-300">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                      {r.quantity != null ? r.quantity.toLocaleString() : <span className="text-gray-300 font-normal">--</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {r.unit || <span className="text-gray-300">--</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(r.production_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-[180px]">
                      {r.notes ? (
                        <span className="truncate block">{r.notes}</span>
                      ) : (
                        <span className="text-gray-300">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(r)}
                          className="p-1.5 text-gray-400 hover:text-purple-700 transition-colors rounded"
                          title="Edit record"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(r.id)}
                          disabled={deleting === r.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded disabled:opacity-40"
                          title="Delete record"
                        >
                          {deleting === r.id ? (
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
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            Showing {filtered.length} of {list.length} records
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(null)} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Record</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this food ministry record? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={closeModal} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingRecord ? 'Edit Food Record' : 'Add Food Ministry Record'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item / Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Meal Kits"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this food item or batch..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="lbs / boxes / meals"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Production Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.production_date}
                    onChange={(e) => setFormData({ ...formData, production_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes about this batch or preparation..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className={cn(
                      'flex-1 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50',
                      classes.buttonPrimary
                    )}
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingRecord ? 'Update Record' : 'Save Record'}
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
