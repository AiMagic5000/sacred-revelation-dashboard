'use client'

import { DashboardTheme, getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/ThemeProvider'
import {
  FileText,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  FolderOpen,
  Shield,
} from 'lucide-react'

interface TaxDocument {
  id: string
  name: string
  type: string
  year: string
  status: 'filed' | 'pending' | 'not_required'
  dueDate?: string
  filedDate?: string
}

const taxDocuments: TaxDocument[] = [
  { id: '1', name: 'Form 990-N (e-Postcard)', type: 'Annual Filing', year: '2024', status: 'not_required', dueDate: 'May 15, 2025' },
  { id: '2', name: '508(c)(1)(A) Exemption Letter', type: 'IRS Recognition', year: '2024', status: 'filed', filedDate: 'Feb 1, 2024' },
  { id: '3', name: 'State Tax Exemption Certificate', type: 'State Filing', year: '2024', status: 'filed', filedDate: 'Jan 20, 2024' },
  { id: '4', name: 'Property Tax Exemption', type: 'County Filing', year: '2024', status: 'pending', dueDate: 'Dec 31, 2024' },
  { id: '5', name: 'Sales Tax Exemption Certificate', type: 'State Filing', year: '2024', status: 'filed', filedDate: 'Mar 15, 2024' },
  { id: '6', name: 'Agricultural Exemption Certificate', type: 'State Filing', year: '2024', status: 'filed', filedDate: 'Apr 1, 2024' },
]

export default function TaxDocumentsPage() {
  return (
    <ThemeProvider>
      {(theme) => <TaxDocumentsContent theme={theme} />}
    </ThemeProvider>
  )
}

function TaxDocumentsContent({ theme }: { theme: DashboardTheme }) {
  const classes = getThemeClasses(theme)

  const statusConfig = {
    filed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100', label: 'Filed' },
    pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100', label: 'Pending' },
    not_required: { icon: Shield, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Not Required' },
  }

  const filedCount = taxDocuments.filter(d => d.status === 'filed').length
  const pendingCount = taxDocuments.filter(d => d.status === 'pending').length

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className={cn('w-7 h-7', classes.textPrimary)} />
          Tax Documents
        </h1>
        <p className="text-gray-500 mt-1">508(c)(1)(A) tax exemption filings and compliance documents</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <FolderOpen className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{taxDocuments.length}</p>
              <p className="text-sm text-gray-500">Total Documents</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{filedCount}</p>
              <p className="text-sm text-gray-500">Filed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">Active</p>
              <p className="text-sm text-gray-500">Tax Exempt Status</p>
            </div>
          </div>
        </div>
      </div>

      {/* 508 Exemption Info */}
      <div className={cn('rounded-xl p-6', classes.bgLight)}>
        <div className="flex items-start gap-4">
          <div className={cn('p-3 rounded-lg', classes.bgPrimary)}>
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">508(c)(1)(A) Tax Exempt Status</h3>
            <p className="text-sm text-gray-600 mb-3">
              As a 508(c)(1)(A) religious organization, you are automatically exempt from federal income tax
              and are NOT required to file Form 990. However, you may need to file state and local exemption
              applications to receive property tax, sales tax, and other exemptions.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-gray-700">No Form 990 filing required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Tax Documents & Filings</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {taxDocuments.map((doc) => {
            const status = statusConfig[doc.status]
            const StatusIcon = status.icon
            return (
              <div key={doc.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn('p-2 rounded-lg', status.bg)}>
                    <FileText className={cn('w-5 h-5', status.color)} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span>{doc.type}</span>
                      <span>•</span>
                      <span>{doc.year}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={cn('flex items-center gap-1.5 text-sm font-medium', status.color)}>
                      <StatusIcon className="w-4 h-4" />
                      {status.label}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {doc.filedDate ? `Filed ${doc.filedDate}` : doc.dueDate ? `Due ${doc.dueDate}` : ''}
                    </p>
                  </div>
                  {doc.status === 'filed' && (
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                      <Download className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Important Dates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className={cn('w-5 h-5', classes.textPrimary)} />
          Important Dates
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span className="font-medium text-gray-900">Property Tax Exemption Application</span>
            </div>
            <span className="text-sm font-medium text-yellow-700">Due Dec 31, 2024</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">Annual Report (if required by state)</span>
            </div>
            <span className="text-sm text-gray-500">Due annually</span>
          </div>
        </div>
      </div>
    </div>
  )
}
