'use client'

import { useState } from 'react'
import {
  GraduationCap,
  Plus,
  Download,
  Edit2,
  Trash2,
  X,
  Loader2,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { useCoachingSessions, CoachingSession } from '@/hooks/useData'
import { coachingApi, CreateCoachingSessionData, UpdateCoachingSessionData } from '@/lib/api'

const SESSION_TYPES = [
  'Training',
  'Counseling',
  'Prayer',
  'Mentoring',
  'Assessment',
] as const

const SESSION_STATUSES = [
  'scheduled',
  'completed',
  'cancelled',
  'no-show',
] as const

interface FormData {
  coach_name: string
  client_name: string
  session_type: string
  session_date: string
  duration_minutes: string
  status: string
  notes: string
}

const initialFormData: FormData = {
  coach_name: '',
  client_name: '',
  session_type: 'Training',
  session_date: new Date().toISOString().split('T')[0],
  duration_minutes: '60',
  status: 'scheduled',
  notes: '',
}

export default function LifeCoachingPage() {
  const classes = getThemeClasses('sacred')
  const { data: sessions, isLoading, mutate } = useCoachingSessions()

  const [showModal, setShowModal] = useState(false)
  const [editingSession, setEditingSession] = useState<CoachingSession | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const sessionsList = sessions || []

  // Stats
  const totalSessions = sessionsList.length
  const completedSessions = sessionsList.filter((s) => s.status === 'completed').length
  const totalHours = (
    sessionsList.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60
  ).toFixed(1)
  const activeCoaches = new Set(sessionsList.map((s) => s.coach_name)).size

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'no-show': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-3 h-3" />
      case 'completed': return <CheckCircle2 className="w-3 h-3" />
      case 'cancelled': return <XCircle className="w-3 h-3" />
      case 'no-show': return <AlertCircle className="w-3 h-3" />
      default: return null
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Training': return 'bg-purple-100 text-purple-800'
      case 'Counseling': return 'bg-amber-100 text-amber-800'
      case 'Prayer': return 'bg-pink-100 text-pink-800'
      case 'Mentoring': return 'bg-indigo-100 text-indigo-800'
      case 'Assessment': return 'bg-teal-100 text-teal-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const openAddModal = () => {
    setEditingSession(null)
    setFormData(initialFormData)
    setShowModal(true)
  }

  const openEditModal = (session: CoachingSession) => {
    setEditingSession(session)
    setFormData({
      coach_name: session.coach_name || '',
      client_name: session.client_name || '',
      session_type: session.session_type || 'Training',
      session_date: session.session_date?.split('T')[0] || '',
      duration_minutes: String(session.duration_minutes || 60),
      status: session.status || 'scheduled',
      notes: session.notes || '',
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
      const payload: CreateCoachingSessionData | UpdateCoachingSessionData = {
        coach_name: formData.coach_name,
        client_name: formData.client_name,
        session_type: formData.session_type as CreateCoachingSessionData['session_type'],
        session_date: formData.session_date,
        duration_minutes: parseInt(formData.duration_minutes, 10) || 60,
        status: formData.status as CreateCoachingSessionData['status'],
        notes: formData.notes || undefined,
      }

      if (editingSession) {
        await coachingApi.update(editingSession.id, payload as UpdateCoachingSessionData)
      } else {
        await coachingApi.create(payload as CreateCoachingSessionData)
      }

      await mutate()
      closeModal()
    } catch (error) {
      console.error('Error saving coaching session:', error)
      alert('Failed to save session. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this coaching session?')) return

    setDeleting(id)
    try {
      await coachingApi.delete(id)
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

    const headers = ['Coach', 'Client', 'Type', 'Date', 'Duration (min)', 'Status', 'Notes']
    const rows = sessionsList.map((s) => [
      s.coach_name,
      s.client_name,
      s.session_type,
      s.session_date,
      String(s.duration_minutes || 0),
      s.status,
      s.notes || '',
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `life-coaching-${new Date().toISOString().split('T')[0]}.csv`
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
          <h1 className="text-2xl font-bold text-gray-900">Life Coaching</h1>
          <p className="text-gray-500 mt-1">
            Track coaching sessions for training, counseling, prayer, mentoring, and assessment
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
              <p className="text-sm text-gray-500">Completed Sessions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{completedSessions}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <CheckCircle2 className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalHours} hrs</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Clock className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Coaches</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeCoaches}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Users className={cn('w-6 h-6', classes.textPrimary)} />
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
            <GraduationCap className={cn('w-12 h-12 mx-auto mb-4 opacity-30', classes.textPrimary)} />
            <p className="text-gray-500 mb-4">No coaching sessions recorded yet</p>
            <button
              onClick={openAddModal}
              className={cn('px-4 py-2 rounded-lg font-medium', classes.buttonPrimary)}
            >
              Schedule First Session
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Coach
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Client
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Duration
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Status
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
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium',
                          classes.bgPrimary
                        )}>
                          {session.coach_name
                            .split(' ')
                            .map((w) => w[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {session.coach_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {session.client_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        getTypeBadge(session.session_type)
                      )}>
                        {session.session_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(session.session_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {session.duration_minutes} min
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full capitalize inline-flex items-center gap-1',
                        getStatusBadge(session.status)
                      )}>
                        {getStatusIcon(session.status)}
                        {session.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(session)}
                          className="p-1 text-gray-400 hover:text-purple-700 transition-colors"
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
                  {editingSession ? 'Edit Coaching Session' : 'Schedule Coaching Session'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coach Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.coach_name}
                      onChange={(e) => setFormData({ ...formData, coach_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                      placeholder="Coach name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.client_name}
                      onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                      placeholder="Client name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Type *
                  </label>
                  <select
                    required
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    >
                      {SESSION_STATUSES.map((s) => (
                        <option key={s} value={s} className="capitalize">
                          {s.replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="Session notes or goals..."
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
