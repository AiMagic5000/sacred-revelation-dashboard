'use client'

import { useState, useMemo } from 'react'
import { getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { useEvents, Event } from '@/hooks/useData'
import { eventsApi, CreateEventData, UpdateEventData } from '@/lib/api'
import {
  Calendar,
  Clock,
  MapPin,
  Music,
  Plus,
  Users,
  Edit2,
  Trash2,
  X,
  Loader2,
  Search,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Power,
  BookOpen,
  Heart,
  Sparkles,
  Star,
} from 'lucide-react'

type ServiceType =
  | 'Sunday Worship'
  | 'Wednesday Bible Study'
  | 'Friday Prayer'
  | 'Special Service'
  | 'Holiday Service'

const SERVICE_TYPES: ServiceType[] = [
  'Sunday Worship',
  'Wednesday Bible Study',
  'Friday Prayer',
  'Special Service',
  'Holiday Service',
]

// Map service types to event_type strings stored in DB
const SERVICE_TYPE_DB_VALUES: Record<ServiceType, string> = {
  'Sunday Worship': 'sunday_worship',
  'Wednesday Bible Study': 'wednesday_bible_study',
  'Friday Prayer': 'friday_prayer',
  'Special Service': 'special_service',
  'Holiday Service': 'holiday_service',
}

const DB_VALUE_TO_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(SERVICE_TYPE_DB_VALUES).map(([label, value]) => [value, label])
)

// Also treat existing event_type values as services
const ALL_SERVICE_DB_VALUES = new Set([
  ...Object.values(SERVICE_TYPE_DB_VALUES),
  'service',
  'Worship Service',
  'worship',
])

const serviceTypeConfig: Record<string, { color: string; textColor: string; dotColor: string; icon: typeof Calendar }> = {
  sunday_worship: { color: 'bg-purple-100', textColor: 'text-purple-800', dotColor: 'bg-purple-500', icon: Music },
  wednesday_bible_study: { color: 'bg-blue-100', textColor: 'text-blue-800', dotColor: 'bg-blue-500', icon: BookOpen },
  friday_prayer: { color: 'bg-rose-100', textColor: 'text-rose-800', dotColor: 'bg-rose-500', icon: Heart },
  special_service: { color: 'bg-amber-100', textColor: 'text-amber-800', dotColor: 'bg-amber-500', icon: Sparkles },
  holiday_service: { color: 'bg-emerald-100', textColor: 'text-emerald-800', dotColor: 'bg-emerald-500', icon: Star },
  service: { color: 'bg-indigo-100', textColor: 'text-indigo-800', dotColor: 'bg-indigo-500', icon: Calendar },
  'Worship Service': { color: 'bg-purple-100', textColor: 'text-purple-800', dotColor: 'bg-purple-500', icon: Music },
  worship: { color: 'bg-purple-100', textColor: 'text-purple-800', dotColor: 'bg-purple-500', icon: Music },
}

const defaultServiceConfig = { color: 'bg-gray-100', textColor: 'text-gray-800', dotColor: 'bg-gray-500', icon: Calendar }

function getServiceConfig(type?: string) {
  return serviceTypeConfig[type || ''] || defaultServiceConfig
}

function getServiceLabel(eventType?: string): string {
  if (!eventType) return 'Service'
  return DB_VALUE_TO_LABEL[eventType] || eventType
}

interface ServiceFormData {
  title: string
  description: string
  service_type: ServiceType
  start_date: string
  end_date: string
  location: string
  leader: string
  attendance_estimate: string
  recurring: boolean
}

const initialFormData: ServiceFormData = {
  title: '',
  description: '',
  service_type: 'Sunday Worship',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  location: '',
  leader: '',
  attendance_estimate: '',
  recurring: true,
}

export default function ServicesPage() {
  const classes = getThemeClasses('sacred')
  const { data: allEvents, isLoading, error, mutate } = useEvents()

  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState<ServiceFormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Filter events to only show services
  const serviceEvents = useMemo(() => {
    if (!allEvents) return []
    return allEvents.filter((e) => ALL_SERVICE_DB_VALUES.has(e.event_type || ''))
  }, [allEvents])

  const filteredServices = useMemo(() => {
    let list = serviceEvents
    if (filterType !== 'all') {
      list = list.filter((e) => e.event_type === filterType)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.location || '').toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [serviceEvents, filterType, searchQuery])

  // Calendar helpers
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const getServicesForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return filteredServices.filter((e) => e.start_date.split('T')[0] === dateStr)
  }

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  // Stats
  const thisMonthServices = serviceEvents.filter((e) => {
    const d = new Date(e.start_date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const recurringServices = serviceEvents.filter((e) => e.recurring).length

  const upcomingServices = serviceEvents
    .filter((e) => new Date(e.start_date) >= new Date())
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())

  // Group by type for summary
  const typeBreakdown = useMemo(() => {
    const counts: Record<string, number> = {}
    serviceEvents.forEach((e) => {
      const key = e.event_type || 'other'
      counts[key] = (counts[key] || 0) + 1
    })
    return counts
  }, [serviceEvents])

  // CRUD handlers
  const openAddModal = () => {
    setEditingEvent(null)
    setFormData(initialFormData)
    setShowModal(true)
  }

  const openEditModal = (event: Event) => {
    setEditingEvent(event)
    const matchedType = Object.entries(SERVICE_TYPE_DB_VALUES).find(
      ([, val]) => val === event.event_type
    )
    setFormData({
      title: event.title || '',
      description: event.description || '',
      service_type: (matchedType ? matchedType[0] : 'Sunday Worship') as ServiceType,
      start_date: event.start_date?.split('T')[0] || '',
      end_date: event.end_date?.split('T')[0] || '',
      location: event.location || '',
      leader: '',
      attendance_estimate: '',
      recurring: event.recurring || false,
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
      const dbType = SERVICE_TYPE_DB_VALUES[formData.service_type]
      const payload: CreateEventData | UpdateEventData = {
        title: formData.title,
        description: formData.description || undefined,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        location: formData.location || undefined,
        event_type: dbType,
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
      const message = err instanceof Error ? err.message : 'Failed to save service'
      alert(message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    setDeleting(id)
    try {
      await eventsApi.delete(id)
      await mutate()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete service'
      alert(message)
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleRecurring = async (event: Event) => {
    try {
      await eventsApi.update(event.id, { recurring: !event.recurring })
      await mutate()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update service'
      alert(message)
    }
  }

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
        <p className="text-gray-600">Failed to load services. Please try again.</p>
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
            <Music className={cn('w-7 h-7', classes.textPrimary)} />
            Worship Services
          </h1>
          <p className="text-gray-500 mt-1">Manage recurring services and special gatherings</p>
        </div>
        <button
          onClick={openAddModal}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-lg font-medium', classes.buttonPrimary)}
        >
          <Plus className="w-5 h-5" />
          Add Service
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search services by title, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-700 focus:border-transparent"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-700 focus:border-transparent bg-white"
        >
          <option value="all">All Service Types</option>
          {Object.entries(SERVICE_TYPE_DB_VALUES).map(([label, value]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Services', value: serviceEvents.length, icon: Calendar },
          { label: 'This Month', value: thisMonthServices, icon: Clock },
          { label: 'Recurring', value: recurringServices, icon: Music },
          { label: 'Upcoming', value: upcomingServices.length, icon: Users },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className={cn('p-3 rounded-lg', classes.bgLight)}>
                <stat.icon className={cn('w-6 h-6', classes.textPrimary)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}

              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-white p-3 min-h-[90px]" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dayServices = getServicesForDay(day)
                const isToday =
                  new Date().toDateString() === new Date(year, month, day).toDateString()

                return (
                  <div
                    key={day}
                    className={cn(
                      'bg-white p-2 min-h-[90px] hover:bg-gray-50 transition-colors',
                      isToday && 'ring-2 ring-inset ring-purple-500'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex items-center justify-center w-7 h-7 text-sm rounded-full',
                        isToday ? 'bg-purple-700 text-white font-semibold' : 'text-gray-700'
                      )}
                    >
                      {day}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayServices.slice(0, 2).map((svc) => {
                        const config = getServiceConfig(svc.event_type)
                        return (
                          <button
                            key={svc.id}
                            onClick={() => openEditModal(svc)}
                            className={cn(
                              'w-full text-left text-[10px] px-1.5 py-0.5 rounded truncate block',
                              config.color,
                              config.textColor
                            )}
                            title={svc.title}
                          >
                            {svc.title}
                          </button>
                        )
                      })}
                      {dayServices.length > 2 && (
                        <div className="text-[10px] text-gray-500 px-1">+{dayServices.length - 2} more</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-3">
              {Object.entries(SERVICE_TYPE_DB_VALUES).map(([label, dbVal]) => {
                const config = getServiceConfig(dbVal)
                return (
                  <div key={dbVal} className="flex items-center gap-1.5">
                    <div className={cn('w-2.5 h-2.5 rounded-full', config.dotColor)} />
                    <span className="text-xs text-gray-600">{label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Services List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Upcoming Services</h2>
            <span className="text-sm text-gray-500">{upcomingServices.length}</span>
          </div>

          {upcomingServices.length === 0 ? (
            <div className="p-8 text-center">
              <Music className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No upcoming services</p>
              <button
                onClick={openAddModal}
                className={cn('px-4 py-2 rounded-lg font-medium', classes.buttonPrimary)}
              >
                Add First Service
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {upcomingServices.slice(0, 12).map((service) => {
                const config = getServiceConfig(service.event_type)
                const ServiceIcon = config.icon
                return (
                  <div key={service.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={cn(
                              'text-xs px-2 py-0.5 rounded-full font-medium',
                              config.color,
                              config.textColor
                            )}
                          >
                            {getServiceLabel(service.event_type)}
                          </span>
                          {service.recurring && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                              Recurring
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900 text-sm">{service.title}</h3>
                        {service.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{service.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(service.start_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          {service.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {service.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => handleToggleRecurring(service)}
                          className={cn(
                            'p-1.5 rounded transition-colors',
                            service.recurring
                              ? 'text-purple-700 hover:bg-purple-100'
                              : 'text-gray-400 hover:bg-gray-100'
                          )}
                          title={service.recurring ? 'Mark as one-time' : 'Mark as recurring'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(service)}
                          className="p-1.5 text-gray-400 hover:text-purple-700 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          disabled={deleting === service.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          {deleting === service.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Service Type Breakdown */}
      {Object.keys(typeBreakdown).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Service Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(typeBreakdown).map(([type, count]) => {
              const config = getServiceConfig(type)
              const ServiceIcon = config.icon
              return (
                <div
                  key={type}
                  className={cn('rounded-xl p-4 text-center', config.color)}
                >
                  <ServiceIcon className={cn('w-8 h-8 mx-auto mb-2', config.textColor)} />
                  <p className={cn('text-2xl font-bold', config.textColor)}>{count}</p>
                  <p className={cn('text-xs mt-1', config.textColor)}>{getServiceLabel(type)}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* All Services Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">All Services</h2>
          <span className="text-sm text-gray-500">{filteredServices.length} total</span>
        </div>

        {filteredServices.length === 0 ? (
          <div className="p-8 text-center">
            <Music className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchQuery || filterType !== 'all'
                ? 'No services match your filters'
                : 'No services recorded yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredServices
              .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
              .map((service) => {
                const config = getServiceConfig(service.event_type)
                const isPast = new Date(service.start_date) < new Date()
                return (
                  <div
                    key={service.id}
                    className={cn('p-4 hover:bg-gray-50 transition-colors', isPast && 'opacity-60')}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'flex flex-col items-center justify-center w-14 h-14 rounded-lg flex-shrink-0',
                          isPast ? 'bg-gray-100' : classes.bgLight
                        )}
                      >
                        <span
                          className={cn(
                            'text-xs font-medium uppercase',
                            isPast ? 'text-gray-500' : classes.textPrimary
                          )}
                        >
                          {new Date(service.start_date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span
                          className={cn(
                            'text-xl font-bold',
                            isPast ? 'text-gray-600' : 'text-gray-900'
                          )}
                        >
                          {new Date(service.start_date).getDate()}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 truncate">{service.title}</h3>
                          <span
                            className={cn(
                              'text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0',
                              config.color,
                              config.textColor
                            )}
                          >
                            {getServiceLabel(service.event_type)}
                          </span>
                          {service.recurring && (
                            <span className="text-xs text-gray-400 flex-shrink-0">(recurring)</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(service.start_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          {service.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {service.location}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(service)}
                          className="p-1.5 text-gray-400 hover:text-purple-700 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          disabled={deleting === service.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          {deleting === service.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={closeModal} />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingEvent ? 'Edit Service' : 'Add New Service'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="Sunday Morning Worship"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                  <select
                    value={formData.service_type}
                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value as ServiceType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                  >
                    {SERVICE_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="Service details, theme, special notes..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
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
                    placeholder="Main Sanctuary, Fellowship Hall..."
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.recurring}
                    onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                    className="w-4 h-4 text-purple-800 border-gray-300 rounded focus:ring-purple-700"
                  />
                  <span className="text-sm font-medium text-gray-700">Recurring Service</span>
                </label>

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
                    {editingEvent ? 'Update Service' : 'Add Service'}
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
