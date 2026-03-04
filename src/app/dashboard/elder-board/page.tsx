'use client'

import { useState } from 'react'
import {
  Users,
  Plus,
  Search,
  Download,
  Edit2,
  Trash2,
  X,
  Loader2,
  FileText,
  CheckCircle2,
  Clock,
  PauseCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getThemeClasses } from '@/lib/themes'
import { useElderResolutions, ElderBoardResolution } from '@/hooks/useData'
import {
  resolutionsApi,
  CreateElderResolutionData,
  UpdateElderResolutionData,
} from '@/lib/api'

const classes = getThemeClasses('sacred')

const RESOLUTION_STATUSES = ['proposed', 'approved', 'rejected', 'tabled'] as const
const VOTE_RESULTS = ['Unanimous', 'Majority', 'Tabled', 'Withdrawn'] as const

interface ResolutionFormData {
  resolution_number: string
  title: string
  description: string
  proposed_by: string
  seconded_by: string
  vote_result: string
  resolution_date: string
  status: string
}

const emptyForm: ResolutionFormData = {
  resolution_number: '',
  title: '',
  description: '',
  proposed_by: '',
  seconded_by: '',
  vote_result: '',
  resolution_date: new Date().toISOString().split('T')[0],
  status: 'proposed',
}

function getStatusBadge(status: string): string {
  switch (status) {
    case 'proposed':
      return 'bg-blue-100 text-blue-800'
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    case 'tabled':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getVoteBadge(result: string): string {
  switch (result) {
    case 'Unanimous':
      return 'bg-green-100 text-green-800'
    case 'Majority':
      return 'bg-blue-100 text-blue-800'
    case 'Tabled':
      return 'bg-yellow-100 text-yellow-800'
    case 'Withdrawn':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function ElderBoardResolutionsPage() {
  const { data: resolutions, isLoading, mutate } = useElderResolutions()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingResolution, setEditingResolution] = useState<ElderBoardResolution | null>(null)
  const [formData, setFormData] = useState<ResolutionFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const list = resolutions || []

  const filtered = list.filter((r) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      r.title.toLowerCase().includes(q) ||
      r.resolution_number.toLowerCase().includes(q) ||
      (r.proposed_by?.toLowerCase().includes(q) ?? false) ||
      (r.seconded_by?.toLowerCase().includes(q) ?? false)
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalResolutions = list.length
  const approvedCount = list.filter((r) => r.status === 'approved').length
  const pendingCount = list.filter((r) => r.status === 'proposed').length
  const tabledCount = list.filter((r) => r.status === 'tabled').length

  const openAddModal = () => {
    setEditingResolution(null)
    const nextNum = `RES-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`
    setFormData({ ...emptyForm, resolution_number: nextNum })
    setShowModal(true)
  }

  const openEditModal = (r: ElderBoardResolution) => {
    setEditingResolution(r)
    setFormData({
      resolution_number: r.resolution_number || '',
      title: r.title || '',
      description: r.description || '',
      proposed_by: r.proposed_by || '',
      seconded_by: r.seconded_by || '',
      vote_result: r.vote_result || '',
      resolution_date: r.resolution_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      status: r.status || 'proposed',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingResolution(null)
    setFormData(emptyForm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        resolution_number: formData.resolution_number,
        title: formData.title,
        description: formData.description || undefined,
        proposed_by: formData.proposed_by || undefined,
        seconded_by: formData.seconded_by || undefined,
        vote_result: (formData.vote_result || undefined) as CreateElderResolutionData['vote_result'],
        resolution_date: formData.resolution_date,
        status: formData.status as CreateElderResolutionData['status'],
      }
      if (editingResolution) {
        await resolutionsApi.update(editingResolution.id, payload as UpdateElderResolutionData)
      } else {
        await resolutionsApi.create(payload as CreateElderResolutionData)
      }
      await mutate()
      closeModal()
    } catch (err) {
      console.error('Error saving resolution:', err)
      alert('Failed to save resolution. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    setShowDeleteConfirm(null)
    try {
      await resolutionsApi.delete(id)
      await mutate()
    } catch (err) {
      console.error('Error deleting resolution:', err)
      alert('Failed to delete resolution. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const handleExport = () => {
    if (!list.length) return
    const headers = [
      'Resolution #',
      'Title',
      'Description',
      'Proposed By',
      'Seconded By',
      'Vote Result',
      'Date',
      'Status',
    ]
    const rows = list.map((r) => [
      r.resolution_number,
      r.title,
      r.description || '',
      r.proposed_by || '',
      r.seconded_by || '',
      r.vote_result || '',
      new Date(r.resolution_date).toLocaleDateString(),
      r.status,
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `elder-board-resolutions-${new Date().toISOString().split('T')[0]}.csv`
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
              <Users className={cn('w-5 h-5', classes.textPrimary)} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Elder Board Resolutions</h1>
          </div>
          <p className="text-gray-500 ml-11">
            Governance records, formal motions, and board decisions
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
            Add Resolution
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Resolutions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalResolutions}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <FileText className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{approvedCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{pendingCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tabled</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{tabledCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50">
              <PauseCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, resolution number, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            {RESOLUTION_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table or Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className={cn('inline-flex p-4 rounded-full mb-4', classes.bgLight)}>
            <FileText className={cn('w-10 h-10', classes.textPrimary)} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery || filterStatus !== 'all'
              ? 'No resolutions match your search'
              : 'No elder board resolutions recorded yet'}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6 text-sm">
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your search terms or filter.'
              : 'Record formal board resolutions, motions, and governance decisions for the Elder Board.'}
          </p>
          {!searchQuery && filterStatus === 'all' && (
            <button
              onClick={openAddModal}
              className={cn('px-5 py-2 rounded-lg font-medium text-sm', classes.buttonPrimary)}
            >
              Add First Resolution
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
                    Resolution #
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proposed By
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seconded By
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vote Result
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                      <span className="font-mono text-sm font-semibold text-purple-700">
                        {r.resolution_number}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{r.title}</p>
                      {r.description && (
                        <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">
                          {r.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {r.proposed_by || <span className="text-gray-300">--</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {r.seconded_by || <span className="text-gray-300">--</span>}
                    </td>
                    <td className="px-6 py-4">
                      {r.vote_result ? (
                        <span
                          className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            getVoteBadge(r.vote_result)
                          )}
                        >
                          {r.vote_result}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-sm">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(r.resolution_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full capitalize',
                          getStatusBadge(r.status)
                        )}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(r)}
                          className="p-1.5 text-gray-400 hover:text-purple-700 transition-colors rounded"
                          title="Edit resolution"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(r.id)}
                          disabled={deleting === r.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded disabled:opacity-40"
                          title="Delete resolution"
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
            Showing {filtered.length} of {list.length} resolutions
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(null)} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Resolution</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this resolution? This action cannot be undone.
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
                  {editingResolution ? 'Edit Resolution' : 'Add Board Resolution'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resolution # <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.resolution_number}
                      onChange={(e) =>
                        setFormData({ ...formData, resolution_number: e.target.value })
                      }
                      placeholder="RES-2026-001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.resolution_date}
                      onChange={(e) =>
                        setFormData({ ...formData, resolution_date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Resolution title"
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
                    placeholder="Detailed description of the resolution..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proposed By
                    </label>
                    <input
                      type="text"
                      value={formData.proposed_by}
                      onChange={(e) => setFormData({ ...formData, proposed_by: e.target.value })}
                      placeholder="Elder name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seconded By
                    </label>
                    <input
                      type="text"
                      value={formData.seconded_by}
                      onChange={(e) => setFormData({ ...formData, seconded_by: e.target.value })}
                      placeholder="Elder name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vote Result
                    </label>
                    <select
                      value={formData.vote_result}
                      onChange={(e) => setFormData({ ...formData, vote_result: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    >
                      <option value="">-- Select --</option>
                      {VOTE_RESULTS.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    >
                      {RESOLUTION_STATUSES.map((s) => (
                        <option key={s} value={s} className="capitalize">
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
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
                    {editingResolution ? 'Update Resolution' : 'Save Resolution'}
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
