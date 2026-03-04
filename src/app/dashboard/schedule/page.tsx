'use client'

import { useState, useMemo } from 'react'
import { getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { useEvents, Event } from '@/hooks/useData'
import { eventsApi, CreateEventData, UpdateEventData } from '@/lib/api'
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Edit2,
  Trash2,
  X,
  Loader2,
  Search,
  AlertCircle,
} from 'lucide-react'

type EventType =
  | 'Worship Service'
  | 'Bible Study'
  | 'Prayer Meeting'
  | 'Fellowship'
  | 'Community Event'
  | 'Board Meeting'

type RecurringPattern = 'weekly' | 'biweekly' | 'monthly'

interface ScheduleFormData {
  title: string
  description: string
  event_type: EventType
  start_date: string
  end_date: string
  location: string
  recurring: boolean
  recurring_pattern: RecurringPattern
}

const EVENT_TYPES: EventType[] = [
  'Worship Service',
  'Bible Study',
  'Prayer Meeting',
  'Fellowship',
  'Community Event',
  'Board Meeting',
]

const eventTypeColors: Record<string, { bg: string; text: string; dot: string }> = {
  'Worship Service': { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
  'Bible Study': { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  'Prayer Meeting': { bg: 'bg-rose-100', text: 'text-rose-800', dot: 'bg-rose-500' },
  'Fellowship': { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
  'Community Event': { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  'Board Meeting': { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500' },
}

const defaultColor = { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' }

const initialFormData: ScheduleFormData = {
  title: '',
  description: '',
  event_type: 'Worship Service',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  location: '',
  recurring: false,
  recurring_pattern: 'weekly',
}

function getColorForType(type?: string) {
  return eventTypeColors[type || ''] || defaultColor
}

export default function SchedulePage() {
  const classes = getThemeClasses('sacred')
  const { data: events, isLoading, error, mutate } = useEvents()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState<ScheduleFormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const eventsList = events || []

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return eventsList
    const q = searchQuery.toLowerCase()
    return eventsList.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.location || '').toLowerCase().includes(q) ||
        (e.event_type || '').toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q)
    )
  }, [eventsList, searchQuery])

  // Calendar helpers
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToToday = () => setCurrentDate(new Date())

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return filteredEvents.filter((e) => {
      const eventDate = e.start_date.split('T')[0]
      return eventDate === dateStr
    })
  }

  const isToday = (day: number) => {
    const today = new Date()
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
  }

  // Stats
  const thisWeekStart = new Date()
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay())
  const thisWeekEnd = new Date(thisWeekStart)
  thisWeekEnd.setDate(thisWeekEnd.getDate() + 7)

  const thisWeekCount = eventsList.filter((e) => {
    const d = new Date(e.start_date)
    return d >= thisWeekStart && d < thisWeekEnd
  }).length

  const upcomingCount = eventsList.filter(
    (e) => new Date(e.start_date) >= new Date()
  ).length

  const recurringCount = eventsList.filter((e) => e.recurring).length

  // Week view helpers
  const getWeekDates = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek)
      d.setDate(d.getDate() + i)
      return d
    })
  }

  const weekDates = getWeekDates()

  const prevWeek = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() - 7)
    setCurrentDate(d)
  }

  const nextWeek = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + 7)
    setCurrentDate(d)
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return filteredEvents.filter((e) => e.start_date.split('T')[0] === dateStr)
  }

  // CRUD handlers
  const openAddModal = (presetDate?: string) => {
    setEditingEvent(null)
    setFormData({
      ...initialFormData,
      start_date: presetDate || new Date().toISOString().split('T')[0],
    })
    setShowModal(true)
  }

  const openEditModal = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title || '',
      description: event.description || '',
      event_type: (event.event_type as EventType) || 'Worship Service',
      start_date: event.start_date?.split('T')[0] || '',
      end_date: event.end_date?.split('T')[0] || '',
      location: event.location || '',
      recurring: event.recurring || false,
      recurring_pattern: 'weekly',
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
      const payload: CreateEventData | UpdateEventData = {
        title: formData.title,
        description: formData.description || undefined,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        location: formData.location || undefined,
        event_type: formData.event_type,
        recurring: formData.recurring,
      }

      if (editingEvent) {
        await eventsApi.update(editingEvent.id, payload as UpdateEventData)
      } else {
        await eventsApi.create(payload as CreateEventData)
      }

      await mutate()
      closeModal()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save event'
      alert(message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    setDeleting(id)
    try {
      await eventsApi.delete(id)
      await mutate()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete event'
      alert(message)
    } finally {
      setDeleting(null)
    }
  }

  // Events for a clicked day
  const selectedDayEvents = selectedDay !== null ? getEventsForDay(selectedDay) : []
  const selectedDateStr = selectedDay !== null
    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : ''

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-800" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-gray-600">Failed to load schedule. Please try again.</p>
        <button onClick={() => mutate()} className={cn('px-4 py-2 rounded-lg font-medium', classes.buttonPrimary)}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className={cn('w-7 h-7', classes.textPrimary)} />
            Schedule
          </h1>
          <p className="text-gray-500 mt-1">Ministry services, outreach events, and meetings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                viewMode === 'week' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
              )}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                viewMode === 'month' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
              )}
            >
              Month
            </button>
          </div>
          <button
            onClick={() => openAddModal()}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-lg font-medium', classes.buttonPrimary)}
          >
            <Plus className="w-5 h-5" />
            Add Event
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search events by title, location, or type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-700 focus:border-transparent"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: eventsList.length, icon: Calendar, color: classes },
          { label: 'This Week', value: thisWeekCount, icon: Clock, color: classes },
          { label: 'Recurring', value: recurringCount, icon: Repeat, color: classes },
          { label: 'Upcoming', value: upcomingCount, icon: Users, color: classes },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className={cn('p-3 rounded-lg', stat.color.bgLight)}>
                <stat.icon className={cn('w-6 h-6', stat.color.textPrimary)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              {viewMode === 'month'
                ? monthLabel
                : `Week of ${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={goToToday}
                className="px-3 py-1 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Today
              </button>
              <button
                onClick={viewMode === 'month' ? prevMonth : prevWeek}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={viewMode === 'month' ? nextMonth : nextWeek}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {viewMode === 'month' ? (
            <div className="p-4">
              <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="bg-gray-50 p-2 text-center text-xs font-medium text-gray-600">
                    {day}
                  </div>
                ))}

                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-white p-2 min-h-[80px]" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dayEvents = getEventsForDay(day)
                  const todayCheck = isToday(day)
                  const isSelected = selectedDay === day

                  return (
                    <div
                      key={day}
                      onClick={() => {
                        setSelectedDay(isSelected ? null : day)
                      }}
                      className={cn(
                        'bg-white p-2 min-h-[80px] cursor-pointer transition-colors hover:bg-gray-50',
                        todayCheck && 'ring-2 ring-inset ring-purple-500',
                        isSelected && 'bg-purple-50'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-flex items-center justify-center w-6 h-6 text-xs rounded-full',
                          todayCheck ? 'bg-purple-700 text-white font-semibold' : 'text-gray-700'
                        )}
                      >
                        {day}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {dayEvents.slice(0, 2).map((ev) => {
                          const color = getColorForType(ev.event_type)
                          return (
                            <div
                              key={ev.id}
                              className={cn('text-[10px] px-1 py-0.5 rounded truncate', color.bg, color.text)}
                              title={ev.title}
                            >
                              {ev.title}
                            </div>
                          )
                        })}
                        {dayEvents.length > 2 && (
                          <div className="text-[10px] text-gray-500 px-1">+{dayEvents.length - 2} more</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-3">
                {EVENT_TYPES.map((type) => {
                  const color = getColorForType(type)
                  return (
                    <div key={type} className="flex items-center gap-1.5">
                      <div className={cn('w-2.5 h-2.5 rounded-full', color.dot)} />
                      <span className="text-xs text-gray-600">{type}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Week View */
            <div className="p-4">
              <div className="grid grid-cols-7 gap-3">
                {weekDates.map((date) => {
                  const dayEvents = getEventsForDate(date)
                  const todayCheck = date.toDateString() === new Date().toDateString()
                  return (
                    <div key={date.toISOString()} className="min-h-[200px]">
                      <div
                        className={cn(
                          'text-center mb-2 pb-2 border-b border-gray-200',
                          todayCheck && 'border-purple-400'
                        )}
                      >
                        <div className="text-xs text-gray-500">
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div
                          className={cn(
                            'inline-flex items-center justify-center w-7 h-7 text-sm rounded-full mt-1',
                            todayCheck ? 'bg-purple-700 text-white font-semibold' : 'text-gray-900'
                          )}
                        >
                          {date.getDate()}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {dayEvents.map((ev) => {
                          const color = getColorForType(ev.event_type)
                          return (
                            <button
                              key={ev.id}
                              onClick={() => openEditModal(ev)}
                              className={cn(
                                'w-full text-left text-[11px] px-1.5 py-1 rounded border-l-2 hover:opacity-80 transition-opacity',
                                color.bg,
                                color.text
                              )}
                              style={{ borderLeftColor: color.dot.replace('bg-', '').includes('purple') ? '#7C3AED' : undefined }}
                            >
                              <div className="font-medium truncate">{ev.title}</div>
                              {ev.location && (
                                <div className="truncate opacity-75">{ev.location}</div>
                              )}
                            </button>
                          )
                        })}
                        <button
                          onClick={() => {
                            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                            openAddModal(dateStr)
                          }}
                          className="w-full text-center text-xs text-gray-400 hover:text-purple-700 hover:bg-purple-50 rounded py-1 transition-colors"
                        >
                          <Plus className="w-3 h-3 inline" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Selected Day or Upcoming */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">
              {selectedDay !== null
                ? `Events on ${new Date(year, month, selectedDay).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
                : 'Upcoming Events'}
            </h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {(selectedDay !== null ? selectedDayEvents : filteredEvents
              .filter((e) => new Date(e.start_date) >= new Date())
              .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
              .slice(0, 10)
            ).length === 0 ? (
              <div className="p-6 text-center">
                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  {selectedDay !== null ? 'No events on this day' : 'No upcoming events'}
                </p>
                {selectedDay !== null && (
                  <button
                    onClick={() => openAddModal(selectedDateStr)}
                    className={cn('mt-3 px-3 py-1.5 text-sm rounded-lg font-medium', classes.buttonPrimary)}
                  >
                    Add Event
                  </button>
                )}
              </div>
            ) : (
              (selectedDay !== null
                ? selectedDayEvents
                : filteredEvents
                    .filter((e) => new Date(e.start_date) >= new Date())
                    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                    .slice(0, 10)
              ).map((event) => {
                const color = getColorForType(event.event_type)
                return (
                  <div key={event.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', color.bg, color.text)}>
                        {event.event_type || 'Event'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(event)}
                          className="p-1 text-gray-400 hover:text-purple-700 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          disabled={deleting === event.id}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          {deleting === event.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm">{event.title}</h3>
                    {event.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(event.start_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </span>
                      )}
                      {event.recurring && (
                        <span className="flex items-center gap-1">
                          <Repeat className="w-3 h-3" />
                          Recurring
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={closeModal} />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingEvent ? 'Edit Event' : 'Schedule New Event'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="Event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="Event description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value as EventType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                  >
                    {EVENT_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="Ministry Center, Fellowship Hall, etc."
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.recurring}
                      onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                      className="w-4 h-4 text-purple-800 border-gray-300 rounded focus:ring-purple-700"
                    />
                    <span className="text-sm font-medium text-gray-700">Recurring Event</span>
                  </label>

                  {formData.recurring && (
                    <select
                      value={formData.recurring_pattern}
                      onChange={(e) =>
                        setFormData({ ...formData, recurring_pattern: e.target.value as RecurringPattern })
                      }
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Biweekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className={cn(
                      'flex-1 px-4 py-2 rounded-xl font-medium flex items-center justify-center gap-2',
                      classes.buttonPrimary,
                      'disabled:opacity-50'
                    )}
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingEvent ? 'Update Event' : 'Schedule Event'}
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
