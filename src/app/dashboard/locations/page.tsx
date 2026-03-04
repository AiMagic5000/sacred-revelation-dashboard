'use client'

import { useState, useMemo } from 'react'
import { getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { useLocations, Location, LocationType } from '@/hooks/useData'
import { locationsApi, CreateLocationData, UpdateLocationData } from '@/lib/api'
import {
  MapPin,
  Plus,
  Phone,
  Clock,
  Users,
  Edit2,
  Trash2,
  X,
  Loader2,
  Search,
  AlertCircle,
  Building2,
  Home,
  Warehouse,
  Sprout,
  Briefcase,
  Church,
  Star,
  Navigation,
  ExternalLink,
} from 'lucide-react'

const LOCATION_TYPES: LocationType[] = [
  'Main Sanctuary',
  'Fellowship Hall',
  'Community Center',
  'Office',
  'Storage',
  'Farm/Garden',
]

const locationTypeConfig: Record<string, { color: string; textColor: string; icon: typeof Building2 }> = {
  'Main Sanctuary': { color: 'bg-purple-100', textColor: 'text-purple-800', icon: Church },
  'Fellowship Hall': { color: 'bg-blue-100', textColor: 'text-blue-800', icon: Home },
  'Community Center': { color: 'bg-emerald-100', textColor: 'text-emerald-800', icon: Building2 },
  'Office': { color: 'bg-amber-100', textColor: 'text-amber-800', icon: Briefcase },
  'Storage': { color: 'bg-gray-100', textColor: 'text-gray-800', icon: Warehouse },
  'Farm/Garden': { color: 'bg-green-100', textColor: 'text-green-800', icon: Sprout },
}

const defaultTypeConfig = { color: 'bg-gray-100', textColor: 'text-gray-800', icon: Building2 }

interface LocationFormData {
  name: string
  address: string
  city: string
  state: string
  zip: string
  location_type: LocationType
  capacity: string
  description: string
  is_primary: boolean
  contact_phone: string
}

const initialFormData: LocationFormData = {
  name: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  location_type: 'Main Sanctuary',
  capacity: '',
  description: '',
  is_primary: false,
  contact_phone: '',
}

function getTypeConfig(type?: string) {
  return locationTypeConfig[type || ''] || defaultTypeConfig
}

export default function LocationsPage() {
  const classes = getThemeClasses('sacred')
  const { data: locations, isLoading, error, mutate } = useLocations()

  const [showModal, setShowModal] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [formData, setFormData] = useState<LocationFormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  const locationsList = locations || []

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return locationsList
    const q = searchQuery.toLowerCase()
    return locationsList.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.address || '').toLowerCase().includes(q) ||
        (l.city || '').toLowerCase().includes(q) ||
        (l.location_type || '').toLowerCase().includes(q) ||
        (l.description || '').toLowerCase().includes(q)
    )
  }, [locationsList, searchQuery])

  // Stats
  const totalCapacity = locationsList.reduce((sum, l) => sum + (l.capacity || 0), 0)
  const primaryCount = locationsList.filter((l) => l.is_primary).length
  const uniqueCities = new Set(locationsList.map((l) => l.city).filter(Boolean)).size

  // CRUD handlers
  const openAddModal = () => {
    setEditingLocation(null)
    setFormData(initialFormData)
    setShowModal(true)
  }

  const openEditModal = (location: Location) => {
    setEditingLocation(location)
    setFormData({
      name: location.name || '',
      address: location.address || '',
      city: location.city || '',
      state: location.state || '',
      zip: location.zip || '',
      location_type: location.location_type || 'Main Sanctuary',
      capacity: location.capacity?.toString() || '',
      description: location.description || '',
      is_primary: location.is_primary || false,
      contact_phone: location.contact_phone || '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingLocation(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload: CreateLocationData | UpdateLocationData = {
        name: formData.name,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zip: formData.zip || undefined,
        location_type: formData.location_type,
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : undefined,
        description: formData.description || undefined,
        is_primary: formData.is_primary,
        contact_phone: formData.contact_phone || undefined,
      }

      if (editingLocation) {
        await locationsApi.update(editingLocation.id, payload as UpdateLocationData)
      } else {
        await locationsApi.create(payload as CreateLocationData)
      }

      await mutate()
      closeModal()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save location'
      alert(message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return
    setDeleting(id)
    try {
      await locationsApi.delete(id)
      if (selectedLocation?.id === id) {
        setSelectedLocation(null)
      }
      await mutate()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete location'
      alert(message)
    } finally {
      setDeleting(null)
    }
  }

  const getGoogleMapsUrl = (location: Location) => {
    const parts = [location.address, location.city, location.state, location.zip].filter(Boolean)
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(', '))}`
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
        <p className="text-gray-600">Failed to load locations. Please try again.</p>
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
            <MapPin className={cn('w-7 h-7', classes.textPrimary)} />
            Locations
          </h1>
          <p className="text-gray-500 mt-1">Manage your ministry locations and facilities</p>
        </div>
        <button
          onClick={openAddModal}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-lg font-medium', classes.buttonPrimary)}
        >
          <Plus className="w-5 h-5" />
          Add Location
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search locations by name, address, city, or type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-700 focus:border-transparent"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Locations', value: locationsList.length, icon: Building2 },
          { label: 'Total Capacity', value: totalCapacity, icon: Users },
          { label: 'Primary Sites', value: primaryCount, icon: Star },
          { label: 'Cities Served', value: uniqueCities, icon: MapPin },
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
        {/* Map Placeholder / Selected Location Detail */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              {selectedLocation ? selectedLocation.name : 'Select a Location'}
            </h2>
            {selectedLocation && (
              <a
                href={getGoogleMapsUrl(selectedLocation)}
                target="_blank"
                rel="noopener noreferrer"
                className={cn('flex items-center gap-1 text-sm font-medium', classes.textPrimary, 'hover:underline')}
              >
                <Navigation className="w-4 h-4" />
                Get Directions
              </a>
            )}
          </div>

          {selectedLocation ? (
            <div className="p-6">
              {/* Map Placeholder */}
              <div className="h-[200px] bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl flex items-center justify-center mb-6 border border-purple-100">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-purple-300 mx-auto mb-2" />
                  <p className="font-medium text-gray-700">{selectedLocation.name}</p>
                  <p className="text-sm text-gray-500">
                    {[selectedLocation.address, selectedLocation.city, selectedLocation.state, selectedLocation.zip]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  <a
                    href={getGoogleMapsUrl(selectedLocation)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-sm text-purple-700 hover:text-purple-900"
                  >
                    Open in Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Location Detail */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Address</h3>
                  {selectedLocation.address && <p className="text-gray-900">{selectedLocation.address}</p>}
                  <p className="text-gray-900">
                    {[selectedLocation.city, selectedLocation.state].filter(Boolean).join(', ')}{' '}
                    {selectedLocation.zip || ''}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Details</h3>
                  <div className="space-y-1">
                    {(() => {
                      const config = getTypeConfig(selectedLocation.location_type)
                      return (
                        <p className="flex items-center gap-2 text-gray-900">
                          <config.icon className="w-4 h-4 text-gray-400" />
                          {selectedLocation.location_type}
                        </p>
                      )
                    })()}
                    {selectedLocation.capacity && (
                      <p className="flex items-center gap-2 text-gray-900">
                        <Users className="w-4 h-4 text-gray-400" />
                        Capacity: {selectedLocation.capacity}
                      </p>
                    )}
                    {selectedLocation.contact_phone && (
                      <a
                        href={`tel:${selectedLocation.contact_phone}`}
                        className="flex items-center gap-2 text-gray-900 hover:text-purple-700"
                      >
                        <Phone className="w-4 h-4 text-gray-400" />
                        {selectedLocation.contact_phone}
                      </a>
                    )}
                  </div>
                </div>
                {selectedLocation.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                    <p className="text-gray-700 text-sm">{selectedLocation.description}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => openEditModal(selectedLocation)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(selectedLocation.id)}
                  disabled={deleting === selectedLocation.id}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors text-red-600 text-sm disabled:opacity-50"
                >
                  {deleting === selectedLocation.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="h-[400px] bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Select a location to see details</p>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                  Click on any location from the list to view its full details and map directions
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Locations List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">All Locations</h2>
            <span className="text-sm text-gray-500">{filteredLocations.length}</span>
          </div>

          {filteredLocations.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {searchQuery ? 'No locations match your search' : 'No locations added yet'}
              </p>
              {!searchQuery && (
                <button
                  onClick={openAddModal}
                  className={cn('px-4 py-2 rounded-lg font-medium', classes.buttonPrimary)}
                >
                  Add First Location
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {filteredLocations.map((location) => {
                const config = getTypeConfig(location.location_type)
                const TypeIcon = config.icon
                return (
                  <div
                    key={location.id}
                    onClick={() => setSelectedLocation(location)}
                    className={cn(
                      'p-4 cursor-pointer transition-colors',
                      selectedLocation?.id === location.id ? 'bg-purple-50' : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {location.is_primary && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Primary
                          </span>
                        )}
                        <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', config.color, config.textColor)}>
                          {location.location_type}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditModal(location)
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(location.id)
                          }}
                          disabled={deleting === location.id}
                          className="p-1 hover:bg-red-100 rounded disabled:opacity-50"
                        >
                          {deleting === location.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <TypeIcon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', classes.textPrimary)} />
                      <div className="min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm truncate">{location.name}</h3>
                        {(location.address || location.city) && (
                          <p className="text-xs text-gray-600 mt-0.5 truncate">
                            {[location.address, location.city].filter(Boolean).join(', ')}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                          {location.capacity && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {location.capacity}
                            </span>
                          )}
                          {location.contact_phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {location.contact_phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={closeModal} />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingLocation ? 'Edit Location' : 'Add New Location'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="Ministry Center, Fellowship Hall..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location Type</label>
                  <select
                    value={formData.location_type}
                    onChange={(e) => setFormData({ ...formData, location_type: e.target.value as LocationType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                  >
                    {LOCATION_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="1234 Faith Street"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                      placeholder="Sacramento"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                      placeholder="CA"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                    <input
                      type="text"
                      value={formData.zip}
                      onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                      placeholder="95814"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                      placeholder="100"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="Additional details about this location..."
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_primary}
                    onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                    className="w-4 h-4 text-purple-800 border-gray-300 rounded focus:ring-purple-700"
                  />
                  <span className="text-sm font-medium text-gray-700">Primary Location</span>
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
                    {editingLocation ? 'Update Location' : 'Add Location'}
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
