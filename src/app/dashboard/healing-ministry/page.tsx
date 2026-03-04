'use client'

import { useState } from 'react'
import {
  Sparkles,
  Plus,
  Download,
  Edit2,
  Trash2,
  X,
  Loader2,
  Users,
  Calendar,
  Activity,
  Heart,
} from 'lucide-react'
import { getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { useHealingSessions, HealingSession } from '@/hooks/useData'
import { healingApi, CreateHealingSessionData, UpdateHealingSessionData } from '@/lib/api'

const SESSION_TYPES = [
  'Prayer',
  'Laying on of Hands',
  'Anointing',
  'Counseling',
  'Natural Health',
  'Sound Healing',
  'Touch Healing',
] as const

interface FormData {
  session_type: string
  facilitator_name: string
  attendees_count: string
  session_date: string
  location: string
  notes: string
  prayer_requests: string
}

const initialFormData: FormData = {
  session_type: 'Prayer',
  facilitator_name: '',
  attendees_count: '0',
  session_date: new Date().toISOString().split('T')[0],
  location: '',
  notes: '',
  prayer_requests: '',
}

export default function HealingMinistryPage() {
  const classes = getThemeClasses('sacred')
  const { data: sessions, isLoading, mutate } = useHealingSessions()

  const [showModal, setShowModal] = useState(false)
  const [editingSession, setEditingSession] = useState<HealingSession | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const sessionsList = sessions || []

  // Stats
  const totalSessions = sessionsList.length
  const totalAttendees = sessionsList.reduce((sum, s) => sum + (s.attendees_count || 0), 0)
  const prayerRequestCount = sessionsList.filter(
    (s) => Array.isArray(s.prayer_requests) && s.prayer_requests.length > 0
  ).length
  const activeSessionTypes = new Set(sessionsList.map((s) => s.session_type)).size

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Prayer': return 'bg-purple-100 text-purple-800'
      case 'Laying on of Hands': return 'bg-amber-100 text-amber-800'
      case 'Anointing': return 'bg-yellow-100 text-yellow-800'
      case 'Counseling': return 'bg-blue-100 text-blue-800'
      case 'Natural Health': return 'bg-green-100 text-green-800'
      case 'Sound Healing': return 'bg-pink-100 text-pink-800'
      case 'Touch Healing': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const openAddModal = () => {
    setEditingSession(null)
    setFormData(initialFormData)
    setShowModal(true)
  }

  const openEditModal = (session: HealingSession) => {
    setEditingSession(session)
    setFormData({
      session_type: session.session_type || 'Prayer',
      facilitator_name: session.facilitator_name || '',
      attendees_count: String(session.attendees_count || 0),
      session_date: session.session_date?.split('T')[0] || '',
      location: session.location || '',
      notes: session.notes || '',
      prayer_requests: Array.isArray(session.prayer_requests)
        ? session.prayer_requests.join(', ')
        : '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingSession(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const prayerList = formData.prayer_requests
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)

      const payload: CreateHealingSessionData | UpdateHealingSessionData = {
        session_type: formData.session_type as CreateHealingSessionData['session_type'],
        facilitator_name: formData.facilitator_name,
        attendees_count: parseInt(formData.attendees_count, 10) || 0,
        session_date: formData.session_date,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
        prayer_requests: prayerList.length > 0 ? prayerList : undefined,
      }

      if (editingSession) {
        await healingApi.update(editingSession.id, payload as UpdateHealingSessionData)
      } else {
        await healingApi.create(payload as CreateHealingSessionData)
      }

      await mutate()
      closeModal()
    } catch (error) {
      console.error('Error saving healing session:', error)
      alert('Failed to save session. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this healing session?')) return

    setDeleting(id)
    try {
      await healingApi.delete(id)
      await mutate()
    } catch (error) {
      console.error('Error deleting session:', error)
      alert('Failed to delete session. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const handleExport = () => {
    if (!sessionsList.length) return

    const headers = ['Session Type', 'Facilitator', 'Attendees', 'Date', 'Location', 'Prayer Requests', 'Notes']
    const rows = sessionsList.map((s) => [
      s.session_type,
      s.facilitator_name,
      String(s.attendees_count || 0),
      s.session_date,
      s.location || '',
      Array.isArray(s.prayer_requests) ? s.prayer_requests.join('; ') : '',
      s.notes || '',
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `healing-ministry-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className={cn('w-8 h-8 animate-spin', classes.textPrimary)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Healing Ministry</h1>
          <p className="text-gray-500 mt-1">
            Track prayer, counseling, natural health, and healing sessions
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
            Add Session
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalSessions}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Calendar className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Attendees</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalAttendees}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Users className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Prayer Requests</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{prayerRequestCount}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Heart className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Session Types</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeSessionTypes}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Activity className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Sessions</h2>
          <span className="text-sm text-gray-500">{sessionsList.length} records</span>
        </div>

        {sessionsList.length === 0 ? (
          <div className="p-12 text-center">
            <Sparkles className={cn('w-12 h-12 mx-auto mb-4 opacity-30', classes.textPrimary)} />
            <p className="text-gray-500 mb-4">No healing sessions recorded yet</p>
            <button
              onClick={openAddModal}
              className={cn('px-4 py-2 rounded-lg font-medium', classes.buttonPrimary)}
            >
              Record First Session
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Session Type
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Facilitator
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Attendees
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Location
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sessionsList.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        getTypeBadge(session.session_type)
                      )}>
                        {session.session_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium',
                          classes.bgPrimary
                        )}>
                          {(session.facilitator_name || 'F').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {session.facilitator_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{session.attendees_count}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(session.session_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {session.location || '--'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(session)}
                          className={cn('p-1 text-gray-400 transition-colors', `hover:${classes.textPrimary}`)}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(session.id)}
                          disabled={deleting === session.id}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === session.id ? (
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
            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingSession ? 'Edit Healing Session' : 'Record Healing Session'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Type
                  </label>
                  <select
                    value={formData.session_type}
                    onChange={(e) => setFormData({ ...formData, session_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                  >
                    {SESSION_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facilitator Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.facilitator_name}
                    onChange={(e) => setFormData({ ...formData, facilitator_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="e.g., Patricia Kay Ward"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attendees
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.attendees_count}
                      onChange={(e) => setFormData({ ...formData, attendees_count: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Session Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.session_date}
                      onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
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
                    placeholder="Ministry center or address"
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
                    placeholder="Session details..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prayer Requests (comma-separated)
                  </label>
                  <textarea
                    value={formData.prayer_requests}
                    onChange={(e) => setFormData({ ...formData, prayer_requests: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="Healing for John, Protection for the family..."
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
                      'flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50',
                      classes.buttonPrimary
                    )}
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingSession ? 'Update' : 'Save'}
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
