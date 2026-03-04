'use client'

import { DashboardTheme, getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/ThemeProvider'
import {
  Building2,
  Users,
  FileText,
  Shield,
  CheckCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
} from 'lucide-react'

export default function TrustDataPage() {
  return (
    <ThemeProvider>
      {(theme) => <TrustDataContent theme={theme} />}
    </ThemeProvider>
  )
}

function TrustDataContent({ theme }: { theme: DashboardTheme }) {
  const classes = getThemeClasses(theme)

  const trustInfo = {
    name: 'Sacred Revelation, A Free Church',
    type: '508(c)(1)(A) Free Church Ministry Trust',
    ein: '39-7070XX',
    formed: 'August 2025',
    state: 'California',
    status: 'Active & Compliant',
  }

  const trustees = [
    { name: 'Patricia Kay Ward', role: 'Presiding Elder', since: '2025' },
    { name: 'Michael C. Ward', role: 'Elder', since: '2025' },
    { name: 'David Williams', role: 'Trustee', since: '2024' },
  ]

  const complianceItems = [
    { item: 'Trust Document Filed', status: 'complete', date: '01/15/2024' },
    { item: 'IRS Recognition', status: 'complete', date: '02/01/2024' },
    { item: 'State Registration', status: 'complete', date: '01/20/2024' },
    { item: 'Annual Report', status: 'pending', date: 'Due 12/31/2025' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className={cn('w-7 h-7', classes.textPrimary)} />
          Trust Data
        </h1>
        <p className="text-gray-500 mt-1">508(c)(1)(A) organization information and compliance status</p>
      </div>

      {/* Trust Overview Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{trustInfo.name}</h2>
            <p className={cn('text-sm font-medium', classes.textPrimary)}>{trustInfo.type}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            {trustInfo.status}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500">EIN Number</p>
            <p className="font-semibold text-gray-900">{trustInfo.ein}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date Formed</p>
            <p className="font-semibold text-gray-900">{trustInfo.formed}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">State</p>
            <p className="font-semibold text-gray-900">{trustInfo.state}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tax Status</p>
            <p className="font-semibold text-gray-900">Tax Exempt</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trustees */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Users className={cn('w-5 h-5', classes.textPrimary)} />
              Board of Trustees
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {trustees.map((trustee, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{trustee.name}</p>
                  <p className="text-sm text-gray-500">{trustee.role}</p>
                </div>
                <span className="text-sm text-gray-400">Since {trustee.since}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Shield className={cn('w-5 h-5', classes.textPrimary)} />
              Compliance Status
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {complianceItems.map((item, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.status === 'complete' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className="font-medium text-gray-900">{item.item}</span>
                </div>
                <span className={cn(
                  'text-sm',
                  item.status === 'complete' ? 'text-gray-400' : 'text-yellow-600 font-medium'
                )}>
                  {item.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <FileText className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-sm text-gray-500">Documents</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">$0</p>
              <p className="text-sm text-gray-500">Total Assets</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-500">Trustees</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-100">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">11</p>
              <p className="text-sm text-gray-500">Months Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
