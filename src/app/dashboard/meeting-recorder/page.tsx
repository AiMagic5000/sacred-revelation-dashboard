'use client'

import { useState } from 'react'
import { DashboardTheme, getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/ThemeProvider'
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  Plus,
  FileText,
  CheckCircle,
  Video,
  ChevronRight,
} from 'lucide-react'

interface Meeting {
  id: string
  title: string
  date: string
  time: string
  location: string
  type: 'trustee' | 'staff' | 'volunteer' | 'planning'
  attendees: string[]
  status: 'scheduled' | 'completed' | 'cancelled'
  hasMinutes: boolean
}

const meetings: Meeting[] = [
  {
    id: '1',
    title: 'Monthly Trustee Meeting',
    date: '2024-12-28',
    time: '2:00 PM',
    location: 'Conference Room',
    type: 'trustee',
    attendees: ['Michael Anderson', 'Sarah Johnson', 'David Williams'],
    status: 'scheduled',
    hasMinutes: false
  },
  {
    id: '2',
    title: 'Q4 Planning Session',
    date: '2024-12-20',
    time: '10:00 AM',
    location: 'Farm Office',
    type: 'planning',
    attendees: ['Michael Anderson', 'Farm Manager', 'Volunteer Coordinator'],
    status: 'completed',
    hasMinutes: true
  },
  {
    id: '3',
    title: 'Volunteer Coordination Meeting',
    date: '2024-12-15',
    time: '9:00 AM',
    location: 'Virtual - Zoom',
    type: 'volunteer',
    attendees: ['Volunteer Coordinator', 'Team Leads'],
    status: 'completed',
    hasMinutes: true
  },
  {
    id: '4',
    title: 'Staff Weekly Standup',
    date: '2024-12-18',
    time: '8:00 AM',
    location: 'Farm Pavilion',
    type: 'staff',
    attendees: ['All Staff'],
    status: 'completed',
    hasMinutes: false
  },
]

const meetingTypeColors = {
  trustee: 'bg-purple-100 text-purple-800 border-purple-200',
  staff: 'bg-blue-100 text-blue-800 border-blue-200',
  volunteer: 'bg-green-100 text-green-800 border-green-200',
  planning: 'bg-amber-100 text-amber-800 border-amber-200',
}

export default function MeetingsPage() {
  return (
    <ThemeProvider>
      {(theme) => <MeetingsContent theme={theme} />}
    </ThemeProvider>
  )
}

function MeetingsContent({ theme }: { theme: DashboardTheme }) {
  const classes = getThemeClasses(theme)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')

  const upcomingMeetings = meetings.filter(m => m.status === 'scheduled')
  const pastMeetings = meetings.filter(m => m.status === 'completed')

  const filteredMeetings = filter === 'upcoming'
    ? upcomingMeetings
    : filter === 'past'
    ? pastMeetings
    : meetings

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className={cn('w-7 h-7', classes.textPrimary)} />
            Meetings
          </h1>
          <p className="text-gray-500 mt-1">Trustee meetings, staff meetings, and ministry planning</p>
        </div>
        <button className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium',
          classes.bgPrimary,
          'hover:opacity-90 transition-opacity'
        )}>
          <Plus className="w-5 h-5" />
          Schedule Meeting
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
              <p className="text-2xl font-bold text-gray-900">{upcomingMeetings.length}</p>
              <p className="text-sm text-gray-500">Upcoming</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pastMeetings.length}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-100">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-500">Trustees</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {meetings.filter(m => m.hasMinutes).length}
              </p>
              <p className="text-sm text-gray-500">Minutes Filed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'upcoming', 'past'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
              filter === tab
                ? cn(classes.bgPrimary, 'text-white')
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Meetings List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">
            {filter === 'all' ? 'All Meetings' : filter === 'upcoming' ? 'Upcoming Meetings' : 'Past Meetings'}
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {filteredMeetings.map((meeting) => (
            <div key={meeting.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium border capitalize',
                      meetingTypeColors[meeting.type]
                    )}>
                      {meeting.type}
                    </span>
                    {meeting.status === 'completed' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900">{meeting.title}</h3>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {meeting.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {meeting.time}
                </span>
                <span className="flex items-center gap-1">
                  {meeting.location.includes('Virtual') ? (
                    <Video className="w-4 h-4" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  {meeting.location}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {meeting.attendees.length > 2
                      ? `${meeting.attendees.slice(0, 2).join(', ')} +${meeting.attendees.length - 2}`
                      : meeting.attendees.join(', ')
                    }
                  </span>
                </div>
                {meeting.hasMinutes && (
                  <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                    <FileText className="w-4 h-4" />
                    View Minutes
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trustee Meeting Requirements */}
      <div className={cn('rounded-xl p-6', classes.bgLight)}>
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className={cn('w-5 h-5', classes.textPrimary)} />
          508(c)(1)(A) Meeting Requirements
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Required Documentation</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Meeting minutes for all trustee meetings
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Attendance records
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Voting records for major decisions
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Best Practices</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Hold regular trustee meetings (monthly recommended)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Document all financial decisions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Keep records for at least 7 years
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
