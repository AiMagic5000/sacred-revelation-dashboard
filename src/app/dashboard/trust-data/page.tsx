'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Building2,
  Users,
  FileText,
  Shield,
  CheckCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  Edit2,
  Save,
  X,
  Loader2,
} from 'lucide-react'

interface TrustData {
  id: string
  organization_id: string
  ministry_name: string
  ein_number: string
  formation_date: string
  state_of_formation: string
  registered_agent: string
  address: string
  created_at: string
  updated_at: string
}

interface ComplianceItem {
  id: string
  title: string
  status: string
  due_date: string
  completed_at: string | null
}

export default function TrustDataPage() {
  const [trustData, setTrustData] = useState<TrustData | null>(null)
  const [compliance, setCompliance] = useState<ComplianceItem[]>([])
  const [donations, setDonations] = useState<{ total: number; count: number }>({ total: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    ministry_name: '',
    ein_number: '',
    formation_date: '',
    state_of_formation: '',
    registered_agent: '',
    address: '',
  })
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [trustRes, compRes, donRes] = await Promise.all([
        fetch('/api/trust-data'),
        fetch('/api/compliance'),
        fetch('/api/donations'),
      ])

      if (trustRes.ok) {
        const data = await trustRes.json()
        if (data && data.id) {
          setTrustData(data)
          setForm({
            ministry_name: data.ministry_name || '',
            ein_number: data.ein_number || '',
            formation_date: data.formation_date || '',
            state_of_formation: data.state_of_formation || '',
            registered_agent: data.registered_agent || '',
            address: data.address || '',
          })
        }
      }

      if (compRes.ok) {
        const cData = await compRes.json()
        setCompliance(Array.isArray(cData) ? cData : cData.data || [])
      }

      if (donRes.ok) {
        const dData = await donRes.json()
        const donationList = Array.isArray(dData) ? dData : dData.data || []
        const total = donationList.reduce((sum: number, d: { amount?: number }) => sum + (d.amount || 0), 0)
        setDonations({ total, count: donationList.length })
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/trust-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to save')
      const data = await res.json()
      setTrustData(data)
      setEditing(false)
      setToast({ type: 'success', message: 'Trust data saved successfully' })
      setTimeout(() => setToast(null), 3000)
    } catch {
      setToast({ type: 'error', message: 'Failed to save trust data' })
      setTimeout(() => setToast(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (trustData) {
      setForm({
        ministry_name: trustData.ministry_name || '',
        ein_number: trustData.ein_number || '',
        formation_date: trustData.formation_date || '',
        state_of_formation: trustData.state_of_formation || '',
        registered_agent: trustData.registered_agent || '',
        address: trustData.address || '',
      })
    }
    setEditing(false)
  }

  const completedCompliance = compliance.filter(c => c.status === 'complete' || c.completed_at).length
  const monthsActive = trustData?.formation_date
    ? Math.max(1, Math.floor((Date.now() - new Date(trustData.formation_date).getTime()) / (30.44 * 86400000)))
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400 mt-3">Loading trust data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border animate-fade-in ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-600" />
            Trust Data
          </h1>
          <p className="text-slate-500 mt-1">508(c)(1)(A) organization information and compliance status</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        )}
      </div>

      {/* Trust Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 animate-fade-up">
        <div className="flex items-start justify-between mb-6">
          <div>
            {editing ? (
              <input
                type="text"
                value={form.ministry_name}
                onChange={(e) => setForm({ ...form, ministry_name: e.target.value })}
                className="text-xl font-bold text-slate-900 border-b-2 border-purple-300 focus:border-purple-600 outline-none pb-1 w-full"
                placeholder="Ministry Name"
              />
            ) : (
              <h2 className="text-xl font-bold text-slate-900">{trustData?.ministry_name || 'Not set'}</h2>
            )}
            <p className="text-sm font-medium text-purple-600 mt-1">508(c)(1)(A) Free Church Ministry Trust</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Active
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-slate-500">EIN Number</p>
            {editing ? (
              <input
                type="text"
                value={form.ein_number}
                onChange={(e) => setForm({ ...form, ein_number: e.target.value })}
                className="font-semibold text-slate-900 border-b border-slate-300 focus:border-purple-600 outline-none w-full mt-1"
                placeholder="XX-XXXXXXX"
              />
            ) : (
              <p className="font-semibold text-slate-900">{trustData?.ein_number || 'Not set'}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-slate-500">Date Formed</p>
            {editing ? (
              <input
                type="date"
                value={form.formation_date}
                onChange={(e) => setForm({ ...form, formation_date: e.target.value })}
                className="font-semibold text-slate-900 border-b border-slate-300 focus:border-purple-600 outline-none w-full mt-1"
              />
            ) : (
              <p className="font-semibold text-slate-900">
                {trustData?.formation_date ? new Date(trustData.formation_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Not set'}
              </p>
            )}
          </div>
          <div>
            <p className="text-sm text-slate-500">State</p>
            {editing ? (
              <input
                type="text"
                value={form.state_of_formation}
                onChange={(e) => setForm({ ...form, state_of_formation: e.target.value })}
                className="font-semibold text-slate-900 border-b border-slate-300 focus:border-purple-600 outline-none w-full mt-1"
                placeholder="State of Formation"
              />
            ) : (
              <p className="font-semibold text-slate-900">{trustData?.state_of_formation || 'Not set'}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-slate-500">Tax Status</p>
            <p className="font-semibold text-emerald-600">Tax Exempt - IRC 508(c)(1)(A)</p>
          </div>
        </div>

        {editing && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-100">
            <div>
              <p className="text-sm text-slate-500 mb-1">Registered Agent</p>
              <input
                type="text"
                value={form.registered_agent}
                onChange={(e) => setForm({ ...form, registered_agent: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 outline-none text-sm"
                placeholder="Registered Agent Name"
              />
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Address</p>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 outline-none text-sm"
                placeholder="Ministry Address"
              />
            </div>
          </div>
        )}
      </div>

      {/* Compliance Status */}
      <div className="bg-white rounded-xl border border-slate-200 animate-fade-up" style={{ animationDelay: '100ms' }}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Compliance Status
          </h3>
          <span className="text-sm text-slate-500">
            {completedCompliance}/{compliance.length} Complete
          </span>
        </div>
        {compliance.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-slate-500 mt-3">No compliance items yet</p>
            <p className="text-slate-400 text-sm">Add compliance items from the Compliance page</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {compliance.map((item, i) => {
              const isComplete = item.status === 'complete' || item.completed_at
              return (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors animate-fade-up" style={{ animationDelay: `${(i + 2) * 50}ms` }}>
                  <div className="flex items-center gap-3">
                    {isComplete ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    )}
                    <span className="font-medium text-slate-900">{item.title}</span>
                  </div>
                  <span className={`text-sm ${isComplete ? 'text-slate-400' : 'text-amber-600 font-medium'}`}>
                    {isComplete ? (item.completed_at ? new Date(item.completed_at).toLocaleDateString() : 'Completed') : (item.due_date ? `Due ${new Date(item.due_date).toLocaleDateString()}` : 'Pending')}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: 'Documents', value: compliance.length || 0, color: 'purple', bg: 'bg-purple-100' },
          { icon: DollarSign, label: 'Total Donations', value: `$${donations.total.toLocaleString()}`, color: 'emerald', bg: 'bg-emerald-100' },
          { icon: Users, label: 'Donations', value: donations.count, color: 'sky', bg: 'bg-sky-100' },
          { icon: Calendar, label: 'Months Active', value: monthsActive, color: 'amber', bg: 'bg-amber-100' },
        ].map((stat, i) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5 animate-fade-up" style={{ animationDelay: `${(i + 4) * 50}ms` }}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
