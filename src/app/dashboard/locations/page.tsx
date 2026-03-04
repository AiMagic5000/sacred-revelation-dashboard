'use client'

import { useState } from 'react'
import { DashboardTheme, getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/ThemeProvider'
import {
  MapPin,
  Plus,
  Phone,
  Mail,
  Clock,
  Users,
  Edit2,
  Trash2,
  ExternalLink,
  Navigation,
  Building2,
  Globe,
} from 'lucide-react'

interface Location {
  id: string
  name: string
  type: 'main' | 'campus' | 'satellite' | 'outreach'
  address: string
  city: string
  state: string
  zip: string
  phone: string
  email: string
  pastor?: string
  capacity: number
  services: string[]
  coordinates: { lat: number; lng: number }
  isPrimary: boolean
}

const mockLocations: Location[] = [
  {
    id: '1',
    name: 'Grace Community Church - Main Campus',
    type: 'main',
    address: '1234 Faith Street',
    city: 'Orlando',
    state: 'FL',
    zip: '32801',
    phone: '(407) 555-1234',
    email: 'main@gracechurch.org',
    pastor: 'Pastor James Wilson',
    capacity: 500,
    services: ['Sunday 9:00 AM', 'Sunday 11:00 AM', 'Wednesday 7:00 PM'],
    coordinates: { lat: 28.5383, lng: -81.3792 },
    isPrimary: true
  },
  {
    id: '2',
    name: 'Grace Community - East Campus',
    type: 'campus',
    address: '5678 Hope Avenue',
    city: 'Winter Park',
    state: 'FL',
    zip: '32789',
    phone: '(407) 555-5678',
    email: 'east@gracechurch.org',
    pastor: 'Pastor Michael Brown',
    capacity: 250,
    services: ['Sunday 10:00 AM', 'Wednesday 7:00 PM'],
    coordinates: { lat: 28.5997, lng: -81.3392 },
    isPrimary: false
  },
  {
    id: '3',
    name: 'Grace Community - South Outreach',
    type: 'outreach',
    address: '910 Mission Road',
    city: 'Kissimmee',
    state: 'FL',
    zip: '34741',
    phone: '(407) 555-9101',
    email: 'south@gracechurch.org',
    capacity: 100,
    services: ['Saturday 6:00 PM'],
    coordinates: { lat: 28.2920, lng: -81.4076 },
    isPrimary: false
  }
]

const locationTypeLabels = {
  main: 'Main Campus',
  campus: 'Campus',
  satellite: 'Satellite',
  outreach: 'Outreach Center'
}

const locationTypeColors = {
  main: 'bg-blue-100 text-blue-800',
  campus: 'bg-purple-100 text-purple-800',
  satellite: 'bg-green-100 text-green-800',
  outreach: 'bg-amber-100 text-amber-800'
}

export default function LocationsPage() {
  return (
    <ThemeProvider>
      {(theme) => <LocationsContent theme={theme} />}
    </ThemeProvider>
  )
}

function LocationsContent({ theme }: { theme: DashboardTheme }) {
  const classes = getThemeClasses(theme)

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(mockLocations[0])
  const [showAddModal, setShowAddModal] = useState(false)

  const getGoogleMapsEmbedUrl = (location: Location) => {
    const address = encodeURIComponent(`${location.address}, ${location.city}, ${location.state} ${location.zip}`)
    return `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${address}`
  }

  const getGoogleMapsDirectionsUrl = (location: Location) => {
    const address = encodeURIComponent(`${location.address}, ${location.city}, ${location.state} ${location.zip}`)
    return `https://www.google.com/maps/dir/?api=1&destination=${address}`
  }

  const totalCapacity = mockLocations.reduce((sum, loc) => sum + loc.capacity, 0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
          <p className="text-gray-600 mt-1">Manage your church locations and campuses</p>
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
          Add Location
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Building2 className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{mockLocations.length}</p>
              <p className="text-sm text-gray-600">Total Locations</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalCapacity}</p>
              <p className="text-sm text-gray-600">Total Capacity</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-100">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">8</p>
              <p className="text-sm text-gray-600">Weekly Services</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-amber-100">
              <Globe className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-600">Cities Served</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              {selectedLocation ? selectedLocation.name : 'Select a Location'}
            </h2>
            {selectedLocation && (
              <a
                href={getGoogleMapsDirectionsUrl(selectedLocation)}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  classes.textPrimary,
                  'hover:underline'
                )}
              >
                <Navigation className="w-4 h-4" />
                Get Directions
              </a>
            )}
          </div>

          {/* Map Placeholder - Replace with actual Google Maps embed */}
          <div className="h-[400px] bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Google Maps Integration</p>
              <p className="text-sm text-gray-400 max-w-xs mx-auto">
                Add your Google Maps API key in settings to enable interactive maps
              </p>
              {selectedLocation && (
                <div className="mt-4 p-4 bg-white rounded-lg shadow-sm inline-block text-left">
                  <p className="font-medium text-gray-900">{selectedLocation.name}</p>
                  <p className="text-sm text-gray-600">{selectedLocation.address}</p>
                  <p className="text-sm text-gray-600">
                    {selectedLocation.city}, {selectedLocation.state} {selectedLocation.zip}
                  </p>
                  <a
                    href={getGoogleMapsDirectionsUrl(selectedLocation)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Open in Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Locations List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">All Locations</h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-[440px] overflow-y-auto">
            {mockLocations.map(location => (
              <div
                key={location.id}
                onClick={() => setSelectedLocation(location)}
                className={cn(
                  'p-4 cursor-pointer transition-colors',
                  selectedLocation?.id === location.id
                    ? classes.bgLight
                    : 'hover:bg-gray-50'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {location.isPrimary && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-medium">
                        Primary
                      </span>
                    )}
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded font-medium',
                      locationTypeColors[location.type]
                    )}>
                      {locationTypeLabels[location.type]}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                </div>
                <h3 className="font-medium text-gray-900 text-sm">{location.name}</h3>
                <p className="text-xs text-gray-600 mt-1">
                  {location.address}, {location.city}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {location.capacity}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {location.services.length} services
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Location Details */}
      {selectedLocation && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {selectedLocation.isPrimary && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                    Primary Location
                  </span>
                )}
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  locationTypeColors[selectedLocation.type]
                )}>
                  {locationTypeLabels[selectedLocation.type]}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{selectedLocation.name}</h2>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-red-600 hover:bg-red-50 hover:border-red-200">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Address</h3>
              <p className="text-gray-900">{selectedLocation.address}</p>
              <p className="text-gray-900">
                {selectedLocation.city}, {selectedLocation.state} {selectedLocation.zip}
              </p>
              <a
                href={getGoogleMapsDirectionsUrl(selectedLocation)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <Navigation className="w-3 h-3" />
                Get Directions
              </a>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Contact</h3>
              <a href={`tel:${selectedLocation.phone}`} className="flex items-center gap-2 text-gray-900 hover:text-blue-600">
                <Phone className="w-4 h-4 text-gray-400" />
                {selectedLocation.phone}
              </a>
              <a href={`mailto:${selectedLocation.email}`} className="flex items-center gap-2 text-gray-900 hover:text-blue-600 mt-1">
                <Mail className="w-4 h-4 text-gray-400" />
                {selectedLocation.email}
              </a>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Service Times</h3>
              <ul className="space-y-1">
                {selectedLocation.services.map((service, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-900">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {service}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Details</h3>
              {selectedLocation.pastor && (
                <p className="text-gray-900 mb-1">
                  <span className="text-gray-500">Pastor:</span> {selectedLocation.pastor}
                </p>
              )}
              <p className="text-gray-900">
                <span className="text-gray-500">Capacity:</span> {selectedLocation.capacity} seats
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Public Info Note */}
      <div className={cn('mt-6 rounded-xl p-6', classes.bgLight)}>
        <div className="flex items-start gap-4">
          <div className={cn('p-3 rounded-lg', classes.bgPrimary)}>
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Public Locations Page</h3>
            <p className="text-sm text-gray-600">
              These locations are displayed on your public website for visitors to find your church.
              Make sure all information is accurate and up-to-date.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
