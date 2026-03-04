'use client'

import { useState } from 'react'
import {
  Music,
  Plus,
  Download,
  Edit2,
  Trash2,
  X,
  Loader2,
  Calendar,
  Clock,
  Mic2,
  LayoutGrid,
} from 'lucide-react'
import { getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { useMusicEvents, MusicEvent } from '@/hooks/useData'
import { musicApi, CreateMusicEventData, UpdateMusicEventData } from '@/lib/api'

const EVENT_TYPES = [
  'Worship Service',
  'Concert',
  'Retreat',
  'Recording Session',
  'Sound Healing',
  'Music Ministry',
  'Praise Night',
] as const

interface FormData {
  event_name: string
  event_type: string
  musicians: string
  songs_performed: string
  event_date: string
  duration_minutes: string
  location: string
  notes: string
}

const initialFormData: FormData = {
  event_name: '',
  event_type: 'Worship Service',
  musicians: '',
  songs_performed: '',
  event_date: new Date().toISOString().split('T')[0],
  duration_minutes: '60',
  location: '',
  notes: '',
}

export default function MusicWorshipPage() {
  const classes = getThemeClasses('sacred')
  const { data: events, isLoading, mutate } = useMusicEvents()

  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<MusicEvent | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const eventsList = events || []

  // Stats
  const totalEvents = eventsList.length
  const totalDurationMinutes = eventsList.reduce((sum, e) => sum + (e.duration_minutes || 0), 0)
  const totalHours = (totalDurationMinutes / 60).toFixed(1)
  const musiciansInvolved = new Set(
    eventsList.flatMap((e) => (Array.isArray(e.musicians) ? e.musicians : []))
  ).size
  const eventTypesUsed = new Set(eventsList.map((e) => e.event_type)).size

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Worship Service': return 'bg-purple-100 text-purple-800'
      case 'Concert': return 'bg-blue-100 text-blue-800'
      case 'Retreat': return 'bg-green-100 text-green-800'
      case 'Recording Session': return 'bg-amber-100 text-amber-800'
      case 'Sound Healing': return 'bg-pink-100 text-pink-800'
      case 'Music Ministry': return 'bg-indigo-100 text-indigo-800'
      case 'Praise Night': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const openAddModal = () => {
    setEditingEvent(null)
    setFormData(initialFormData)
    setShowModal(true)
  }

  const openEditModal = (event: MusicEvent) => {
    setEditingEvent(event)
    setFormData({
      event_name: event.event_name || '',
      event_type: event.event_type || 'Worship Service',
      musicians: Array.isArray(event.musicians) ? event.musicians.join(', ') : '',
      songs_performed: Array.isArray(event.songs_performed) ? event.songs_performed.join(', ') : '',
      event_date: event.event_date?.split('T')[0] || '',
      duration_minutes: String(event.duration_minutes || 60),
      location: event.location || '',
      notes: event.notes || '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingEvent(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const musiciansList = formData.musicians
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean)
      const songsList = formData.songs_performed
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      const payload: CreateMusicEventData | UpdateMusicEventData = {
        event_name: formData.event_name,
        event_type: formData.event_type as CreateMusicEventData['event_type'],
        musicians: musiciansList.length > 0 ? musiciansList : undefined,
        songs_performed: songsList.length > 0 ? songsList : undefined,
        event_date: formData.event_date,
        duration_minutes: parseInt(formData.duration_minutes, 10) || undefined,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
      }

      if (editingEvent) {
        await musicApi.update(editingEvent.id, payload as UpdateMusicEventData)
      } else {
        await musicApi.create(payload as CreateMusicEventData)
      }

      await mutate()
      closeModal()
    } catch (error) {
      console.error('Error saving music event:', error)
      alert('Failed to save event. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this event?')) return

    setDeleting(id)
    try {
      await musicApi.delete(id)
      await mutate()
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Failed to delete event. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const handleExport = () => {
    if (!eventsList.length) return

    const headers = ['Event Name', 'Type', 'Musicians', 'Songs', 'Date', 'Duration (min)', 'Location', 'Notes']
    const rows = eventsList.map((e) => [
      e.event_name,
      e.event_type,
      Array.isArray(e.musicians) ? e.musicians.join('; ') : '',
      Array.isArray(e.songs_performed) ? e.songs_performed.join('; ') : '',
      e.event_date,
      String(e.duration_minutes || 0),
      e.location || '',
      e.notes || '',
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `music-worship-${new Date().toISOString().split('T')[0]}.csv`
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
          <h1 className="text-2xl font-bold text-gray-900">Music & Worship</h1>
          <p className="text-gray-500 mt-1">
            Track worship services, concerts, recording sessions, and sound healing events
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
            Add Event
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Events</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalEvents}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Calendar className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Duration</p>
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
              <p className="text-sm text-gray-500">Musicians Involved</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{musiciansInvolved}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Mic2 className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Event Types Used</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{eventTypesUsed}</p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <LayoutGrid className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Events</h2>
          <span className="text-sm text-gray-500">{eventsList.length} records</span>
        </div>

        {eventsList.length === 0 ? (
          <div className="p-12 text-center">
            <Music className={cn('w-12 h-12 mx-auto mb-4 opacity-30', classes.textPrimary)} />
            <p className="text-gray-500 mb-4">No music & worship events recorded yet</p>
            <button
              onClick={openAddModal}
              className={cn('px-4 py-2 rounded-lg font-medium', classes.buttonPrimary)}
            >
              Add First Event
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Event Name
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Musicians
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Songs
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Duration
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {eventsList.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{event.event_name}</p>
                      {event.location && (
                        <p className="text-xs text-gray-500">{event.location}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        getTypeBadge(event.event_type)
                      )}>
                        {event.event_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {Array.isArray(event.musicians) && event.musicians.length > 0
                        ? event.musicians.join(', ')
                        : '--'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {Array.isArray(event.songs_performed) && event.songs_performed.length > 0
                        ? `${event.songs_performed.length} song${event.songs_performed.length !== 1 ? 's' : ''}`
                        : '--'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(event.event_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {event.duration_minutes ? `${event.duration_minutes} min` : '--'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(event)}
                          className="p-1 text-gray-400 hover:text-purple-700 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          disabled={deleting === event.id}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === event.id ? (
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
                  {editingEvent ? 'Edit Music Event' : 'Add Music Event'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.event_name}
                    onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="e.g., Sunday Morning Worship"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type *
                  </label>
                  <select
                    required
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                  >
                    {EVENT_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Musicians (comma-separated)
                  </label>
                  <textarea
                    value={formData.musicians}
                    onChange={(e) => setFormData({ ...formData, musicians: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="Patricia Ward, Michael Ward"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Songs Performed (comma-separated)
                  </label>
                  <textarea
                    value={formData.songs_performed}
                    onChange={(e) => setFormData({ ...formData, songs_performed: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="Amazing Grace, How Great Thou Art"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    />
                  </div>
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
                    placeholder="Venue or church name"
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
                    placeholder="Additional details..."
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
                    {editingEvent ? 'Update' : 'Save'}
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
