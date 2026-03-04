'use client'

import { useState, useEffect, useRef } from 'react'
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Search,
  Filter,
  FolderOpen,
  File,
  FileCheck,
  Clock,
} from 'lucide-react'
import { DashboardTheme, getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'

interface Document {
  id: string
  name: string
  type: 'trust' | 'compliance' | 'financial' | 'meeting' | 'other'
  size: string
  uploadedAt: string
  uploadedBy: string
  status: 'approved' | 'pending' | 'expired'
}

export default function DocumentsPage() {
  const [theme, setTheme] = useState<DashboardTheme>('sacred')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('dashboard-theme') as DashboardTheme
    if (saved) setTheme(saved)
  }, [])

  const classes = getThemeClasses(theme)

  // Sample documents
  const documents: Document[] = [
    {
      id: '1',
      name: 'Trust Declaration Document.pdf',
      type: 'trust',
      size: '2.4 MB',
      uploadedAt: '2024-01-15',
      uploadedBy: 'Admin',
      status: 'approved',
    },
    {
      id: '2',
      name: 'Bylaws and Operating Agreement.pdf',
      type: 'trust',
      size: '1.8 MB',
      uploadedAt: '2024-01-15',
      uploadedBy: 'Admin',
      status: 'approved',
    },
    {
      id: '3',
      name: 'Annual Compliance Report 2024.pdf',
      type: 'compliance',
      size: '856 KB',
      uploadedAt: '2024-03-01',
      uploadedBy: 'Admin',
      status: 'pending',
    },
    {
      id: '4',
      name: 'Q1 Financial Statement.pdf',
      type: 'financial',
      size: '1.2 MB',
      uploadedAt: '2024-04-15',
      uploadedBy: 'Treasurer',
      status: 'approved',
    },
    {
      id: '5',
      name: 'Board Meeting Minutes - March 2024.pdf',
      type: 'meeting',
      size: '445 KB',
      uploadedAt: '2024-03-20',
      uploadedBy: 'Secretary',
      status: 'approved',
    },
  ]

  const documentTypes = [
    { value: 'all', label: 'All Documents' },
    { value: 'trust', label: 'Trust Documents' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'financial', label: 'Financial' },
    { value: 'meeting', label: 'Meeting Minutes' },
    { value: 'other', label: 'Other' },
  ]

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || doc.type === filterType
    return matchesSearch && matchesType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trust':
        return FileCheck
      case 'compliance':
        return FileText
      case 'financial':
        return File
      case 'meeting':
        return FolderOpen
      default:
        return File
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 mt-1">
            Manage your 508(c)(1)(A) compliance and organizational documents
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
            classes.buttonPrimary
          )}
        >
          <Upload className="w-5 h-5" />
          Upload Document
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Documents</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{documents.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {documents.filter(d => d.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {documents.filter(d => d.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Expired</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {documents.filter(d => d.status === 'expired').length}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': theme === 'sacred' ? '#7E22CE' : '#1E3A5F' } as any}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': theme === 'sacred' ? '#7E22CE' : '#1E3A5F' } as any}
            >
              {documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Document
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uploaded
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDocuments.map((doc) => {
              const TypeIcon = getTypeIcon(doc.type)
              return (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('p-2 rounded-lg', classes.bgLight)}>
                        <TypeIcon className={cn('w-5 h-5', classes.textPrimary)} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-sm text-gray-500">{doc.size}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-sm text-gray-700">
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full capitalize',
                        getStatusBadge(doc.status)
                      )}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {doc.uploadedAt}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-gray-500 mt-4">No documents found</p>
          </div>
        )}
      </div>
    </div>
  )
}
