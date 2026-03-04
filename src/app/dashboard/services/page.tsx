'use client'

import { useState } from 'react'
import { DashboardTheme, getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/ThemeProvider'
import {
  Calendar,
  Clock,
  MapPin,
  Music,
  Plus,
  Users,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface Service {
  id: string
  title: string
  date: string
  time: string
  location: string
  type: 'sunday' | 'wednesday' | 'special' | 'youth'
  musicalGuest?: string
  speaker?: string
  attendance?: number
}

const mockServices: Service[] = [
  {
    id: '1',
    title: 'Sunday Morning Worship',
    date: '2024-12-29',
    time: '10:00 AM',
    location: 'Main Sanctuary',
    type: 'sunday',
    speaker: 'Pastor James Wilson',
    attendance: 245
  },
  {
    id: '2',
    title: 'Wednesday Bible Study',
    date: '2024-12-25',
    time: '7:00 PM',
    location: 'Fellowship Hall',
    type: 'wednesday',
    speaker: 'Elder Michael Brown'
  },
  {
    id: '3',
    title: 'New Year\'s Eve Service',
    date: '2024-12-31',
    time: '10:00 PM',
    location: 'Main Sanctuary',
    type: 'special',
    musicalGuest: 'Grace Worship Band',
    speaker: 'Pastor James Wilson'
  },
  {
    id: '4',
    title: 'Youth Night',
    date: '2024-12-27',
    time: '6:30 PM',
    location: 'Youth Center',
    type: 'youth',
    speaker: 'Youth Pastor Sarah Davis'
  },
  {
    id: '5',
    title: 'Sunday Morning Worship',
    date: '2025-01-05',
    time: '10:00 AM',
    location: 'Main Sanctuary',
    type: 'sunday',
    musicalGuest: 'The Faithful Four Quartet',
    speaker: 'Guest Speaker Rev. Thomas'
  }
]

const serviceTypeColors = {
  sunday: 'bg-blue-100 text-blue-800',
  wednesday: 'bg-purple-100 text-purple-800',
  special: 'bg-amber-100 text-amber-800',
  youth: 'bg-green-100 text-green-800'
}

const serviceTypeLabels = {
  sunday: 'Sunday Service',
  wednesday: 'Midweek',
  special: 'Special Event',
  youth: 'Youth'
}

export default function ServicesPage() {
  return (
    <ThemeProvider>
      {(theme) => <ServicesContent theme={theme} />}
    </ThemeProvider>
  )
}

function ServicesContent({ theme }: { theme: DashboardTheme }) {
  const classes = getThemeClasses(theme)

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showAddModal, setShowAddModal] = useState(false)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    return { daysInMonth, startingDay }
  }

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth)

  const getServicesForDay = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return mockServices.filter(s => s.date === dateStr)
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const upcomingServices = mockServices
    .filter(s => new Date(s.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Calendar</h1>
          <p className="text-gray-600 mt-1">Manage worship services and special events</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium',
            classes.bgPrimary,
            'hover:opacity-90 transition-opacity'
          )}
        >
          <Plus className="w-5 h-5" />
          Add Service
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}

            {/* Empty cells before first day */}
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-white p-3 min-h-[100px]" />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const services = getServicesForDay(day)
              const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString()

              return (
                <div
                  key={day}
                  className={cn(
                    'bg-white p-2 min-h-[100px] hover:bg-gray-50 transition-colors cursor-pointer',
                    isToday && 'ring-2 ring-inset ring-blue-500'
                  )}
                >
                  <span className={cn(
                    'inline-flex items-center justify-center w-7 h-7 text-sm rounded-full',
                    isToday ? 'bg-blue-600 text-white font-semibold' : 'text-gray-700'
                  )}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-1">
                    {services.slice(0, 2).map(service => (
                      <div
                        key={service.id}
                        className={cn(
                          'text-xs px-1.5 py-0.5 rounded truncate',
                          serviceTypeColors[service.type]
                        )}
                        title={service.title}
                      >
                        {service.time.split(' ')[0]}
                      </div>
                    ))}
                    {services.length > 2 && (
                      <div className="text-xs text-gray-500 px-1">
                        +{services.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4">
            {Object.entries(serviceTypeLabels).map(([type, label]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={cn('w-3 h-3 rounded', serviceTypeColors[type as keyof typeof serviceTypeColors])} />
                <span className="text-sm text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Services */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Services</h2>
          <div className="space-y-4">
            {upcomingServices.map(service => (
              <div key={service.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      serviceTypeColors[service.type]
                    )}>
                      {serviceTypeLabels[service.type]}
                    </span>
                    <h3 className="font-medium text-gray-900 mt-1">{service.title}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(service.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {service.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {service.location}
                      </div>
                      {service.musicalGuest && (
                        <div className="flex items-center gap-2">
                          <Music className="w-4 h-4" />
                          {service.musicalGuest}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 hover:bg-gray-100 rounded">
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded">
                      <Trash2 className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Calendar className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-sm text-gray-600">Services This Month</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Users className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">1,245</p>
              <p className="text-sm text-gray-600">Total Attendance</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Music className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-600">Musical Guests</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Clock className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">245</p>
              <p className="text-sm text-gray-600">Avg. Attendance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
