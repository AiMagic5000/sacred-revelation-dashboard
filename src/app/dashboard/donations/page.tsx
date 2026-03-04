'use client'

import { useState } from 'react'
import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Plus,
  Download,
  ArrowUpRight,
  Edit2,
  Trash2,
  X,
  Loader2,
} from 'lucide-react'
import { getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { useDonations, Donation } from '@/hooks/useData'
import { donationsApi, CreateDonationData, UpdateDonationData } from '@/lib/api'

interface DonationFormData {
  donor_name: string
  donor_email: string
  amount: string
  type: 'one-time' | 'recurring'
  status: 'pending' | 'completed' | 'failed'
  payment_method: string
  notes: string
}

const initialFormData: DonationFormData = {
  donor_name: '',
  donor_email: '',
  amount: '',
  type: 'one-time',
  status: 'completed',
  payment_method: 'check',
  notes: '',
}

export default function DonationsPage() {
  const classes = getThemeClasses('sacred')
  const { data: donations, isLoading, mutate } = useDonations()

  const [showModal, setShowModal] = useState(false)
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null)
  const [formData, setFormData] = useState<DonationFormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const donationsList = donations || []
  const totalDonations = donationsList.reduce((sum, d) => sum + (d.amount || 0), 0)
  const recurringDonors = donationsList.filter(d => d.type === 'recurring').length
  const avgDonation = donationsList.length > 0 ? Math.round(totalDonations / donationsList.length) : 0

  const getMethodBadge = (method: string | undefined) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-800'
      case 'check': return 'bg-blue-100 text-blue-800'
      case 'online': return 'bg-purple-100 text-purple-800'
      case 'in-kind': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const openAddModal = () => {
    setEditingDonation(null)
    setFormData(initialFormData)
    setShowModal(true)
  }

  const openEditModal = (donation: Donation) => {
    setEditingDonation(donation)
    setFormData({
      donor_name: donation.donor_name || '',
      donor_email: donation.donor_email || '',
      amount: donation.amount?.toString() || '',
      type: donation.type || 'one-time',
      status: donation.status || 'completed',
      payment_method: donation.payment_method || 'check',
      notes: donation.notes || '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingDonation(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const data: CreateDonationData | UpdateDonationData = {
        donor_name: formData.donor_name,
        donor_email: formData.donor_email || undefined,
        amount: parseFloat(formData.amount),
        type: formData.type,
        status: formData.status,
        payment_method: formData.payment_method,
        notes: formData.notes || undefined,
      }

      if (editingDonation) {
        await donationsApi.update(editingDonation.id, data as UpdateDonationData)
      } else {
        await donationsApi.create(data as CreateDonationData)
      }

      await mutate()
      closeModal()
    } catch (error) {
      console.error('Error saving donation:', error)
      alert('Failed to save donation. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this donation record?')) return

    setDeleting(id)
    try {
      await donationsApi.delete(id)
      await mutate()
    } catch (error) {
      console.error('Error deleting donation:', error)
      alert('Failed to delete donation. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const handleExport = () => {
    if (!donationsList.length) return

    const headers = ['Donor', 'Email', 'Amount', 'Type', 'Status', 'Payment Method', 'Receipt #', 'Date', 'Notes']
    const rows = donationsList.map(d => [
      d.donor_name,
      d.donor_email || '',
      d.amount?.toString() || '0',
      d.type || 'one-time',
      d.status || 'completed',
      d.payment_method || '',
      d.receipt_number || '',
      new Date(d.created_at).toLocaleDateString(),
      d.notes || '',
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `donations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-800" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donations</h1>
          <p className="text-gray-500 mt-1">
            Track and manage your ministry's financial contributions
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
            Record Donation
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Received</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${totalDonations.toLocaleString()}
              </p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <DollarSign className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-500" />
            <span className="text-green-600 font-medium">Active</span>
            <span className="text-gray-500">tracking enabled</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Donations</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {donationsList.length}
              </p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Users className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Donation</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${avgDonation.toLocaleString()}
              </p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <TrendingUp className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Recurring Donors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {recurringDonors}
              </p>
            </div>
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <Calendar className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
          </div>
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Donations</h2>
          <span className="text-sm text-gray-500">{donationsList.length} records</span>
        </div>

        {donationsList.length === 0 ? (
          <div className="p-8 text-center">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No donations recorded yet</p>
            <button
              onClick={openAddModal}
              className={cn('mt-4 px-4 py-2 rounded-lg font-medium', classes.buttonPrimary)}
            >
              Record First Donation
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Donor
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Method
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Receipt #
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {donationsList.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium',
                          classes.bgPrimary
                        )}>
                          {(donation.donor_name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{donation.donor_name}</p>
                          {donation.donor_email && (
                            <p className="text-xs text-gray-500">{donation.donor_email}</p>
                          )}
                          {donation.type === 'recurring' && (
                            <span className="text-xs text-purple-800 font-medium">Recurring</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        ${(donation.amount || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full capitalize',
                        getMethodBadge(donation.payment_method)
                      )}>
                        {donation.payment_method || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full capitalize',
                        getStatusBadge(donation.status)
                      )}>
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {donation.receipt_number || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(donation.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(donation)}
                          className="p-1 text-gray-400 hover:text-purple-800 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(donation.id)}
                          disabled={deleting === donation.id}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === donation.id ? (
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
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingDonation ? 'Edit Donation' : 'Record New Donation'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Donor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.donor_name}
                    onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.donor_email}
                    onChange={(e) => setFormData({ ...formData, donor_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                      placeholder="100.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'one-time' | 'recurring' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    >
                      <option value="one-time">One-time</option>
                      <option value="recurring">Recurring</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'pending' | 'completed' | 'failed' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                    >
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                  >
                    <option value="check">Check</option>
                    <option value="cash">Cash</option>
                    <option value="online">Online</option>
                    <option value="in-kind">In-Kind</option>
                  </select>
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
                    placeholder="Any additional notes..."
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
                      'flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2',
                      classes.buttonPrimary,
                      'disabled:opacity-50'
                    )}
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingDonation ? 'Update' : 'Save'}
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
