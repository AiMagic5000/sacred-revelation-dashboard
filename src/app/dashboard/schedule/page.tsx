'use client'

import { useState } from 'react'
import { DashboardTheme, getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/ThemeProvider'
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface ScheduleEvent {
  id: string
  title: string
  date: string
  time: string
  location: string
  type: 'worship' | 'outreach' | 'volunteer' | 'meeting' | 'ministry'
  attendees?: number
}

const mockEvents: ScheduleEvent[] = [
  { id: '1', title: 'Sunday Worship Service', date: '2024-12-24', time: '10:00 AM', location: 'Ministry Center', type: 'worship', attendees: 45 },
  { id: '2', title: 'Community Outreach', date: '2024-12-24', time: '2:00 PM', location: 'Sacramento Community Center', type: 'outreach', attendees: 30 },
  { id: '3', title: 'Volunteer Orientation', date: '2024-12-25', time: '9:00 AM', location: 'Ministry Office', type: 'volunteer', attendees: 8 },
  { id: '4', title: 'Elder Board Meeting', date: '2024-12-26', time: '2:00 PM', location: 'Conference Room', type: 'meeting', attendees: 3 },
  { id: '5', title: 'Healing Prayer Session', date: '2024-12-27', time: '7:00 PM', location: 'Ministry Center', type: 'ministry' },
  { id: '6', title: 'Food Ministry Distribution', date: '2024-12-28', time: '10:00 AM', location: 'Partner Church', type: 'outreach', attendees: 75 },
]

const eventTypeColors = {
  worship: 'bg-purple-100 text-purple-800 border-purple-200',
  outreach: 'bg-blue-100 text-blue-800 border-blue-200',
  volunteer: 'bg-amber-100 text-amber-800 border-amber-200',
  meeting: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  ministry: 'bg-pink-100 text-pink-800 border-pink-200',
}

export default function SchedulePage() {
  return (
    <ThemeProvider>
      {(theme) => <ScheduleContent theme={theme} />}
    </ThemeProvider>
  )
}

function ScheduleContent({ theme }: { theme: DashboardTheme }) {
  const classes = getThemeClasses(theme)
  const [currentDate, setCurrentDate] = useState(new Date())

  const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const upcomingEvents = mockEvents.slice(0, 5)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className={cn('w-7 h-7', classes.textPrimary)} />
            Schedule
          </h1>
          <p className="text-gray-500 mt-1">Ministry services, outreach events, and meetings</p>
        </div>
        <button className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium',
          classes.bgPrimary,
          'hover:opacity-90 transition-opacity'
        )}>
          <Plus className="w-5 h-5" />
          Add Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Calendar className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{mockEvents.length}</p>
              <p className="text-sm text-gray-500">This Week</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">2</p>
              <p className="text-sm text-gray-500">Services</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">2</p>
              <p className="text-sm text-gray-500">Distributions</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-100">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">133</p>
              <p className="text-sm text-gray-500">Expected Attendees</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">{currentMonth}</h2>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="p-4">
            {/* Simple Calendar Grid Placeholder */}
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-2 text-gray-500 font-medium">{day}</div>
              ))}
              {Array.from({ length: 35 }, (_, i) => {
                const dayNum = i - 6 // Offset for December 2024
                const isCurrentMonth = dayNum > 0 && dayNum <= 31
                const hasEvent = mockEvents.some(e => {
                  const eventDay = parseInt(e.date.split('-')[2])
                  return eventDay === dayNum
                })
                return (
                  <div
                    key={i}
                    className={cn(
                      'py-2 rounded-lg',
                      isCurrentMonth ? 'text-gray-900' : 'text-gray-300',
                      hasEvent && isCurrentMonth && classes.bgLight,
                      dayNum === 24 && 'ring-2 ring-offset-1',
                      dayNum === 24 && classes.textPrimary
                    )}
                  >
                    {isCurrentMonth ? dayNum : ''}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Upcoming Events</h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
            {upcomingEvents.map(event => (
              <div key={event.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium border capitalize',
                    eventTypeColors[event.type]
                  )}>
                    {event.type}
                  </span>
                  <span className="text-xs text-gray-400">{event.date}</span>
                </div>
                <h3 className="font-medium text-gray-900">{event.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {event.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {event.location}
                  </span>
                </div>
                {event.attendees && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                    <Users className="w-3.5 h-3.5" />
                    {event.attendees} expected
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
