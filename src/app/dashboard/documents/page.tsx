'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Search,
  FolderOpen,
  File,
  Image as ImageIcon,
  Camera,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Eye,
  Calendar,
  HardDrive,
  Tag,
} from 'lucide-react'
import { cn, formatBytes } from '@/lib/utils'
import { DashboardTheme, getThemeClasses } from '@/lib/themes'
import type { DocumentRecord } from '@/hooks/useData'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES = [
  { value: 'all', label: 'All Categories', color: 'bg-slate-100 text-slate-700' },
  { value: 'Receipts', label: 'Receipts', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'Tax Documents', label: 'Tax Documents', color: 'bg-amber-100 text-amber-700' },
  { value: 'Meeting Minutes', label: 'Meeting Minutes', color: 'bg-sky-100 text-sky-700' },
  { value: 'Legal Documents', label: 'Legal Documents', color: 'bg-rose-100 text-rose-700' },
  { value: 'Financial Reports', label: 'Financial Reports', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'Ministry Forms', label: 'Ministry Forms', color: 'bg-primary-100 text-primary-700' },
  { value: 'Other', label: 'Other', color: 'bg-slate-100 text-slate-600' },
] as const

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
].join(',')

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getMonthLabel(key: string): string {
  const [year, month] = key.split('-')
  const d = new Date(Number(year), Number(month) - 1, 1)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function getCategoryBadge(category: string): string {
  const match = CATEGORIES.find((c) => c.value === category)
  return match ? match.color : 'bg-slate-100 text-slate-600'
}

function getFileIcon(type: string) {
  switch (type) {
    case 'image':
      return ImageIcon
    case 'pdf':
      return FileText
    case 'spreadsheet':
      return File
    case 'document':
      return FileText
    default:
      return File
  }
}

function isImageType(type: string): boolean {
  return type === 'image'
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UploadItem {
  id: string
  file: File
  category: string
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function DocumentsPage() {
  const [theme, setTheme] = useState<DashboardTheme>('sacred')
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [activeFolder, setActiveFolder] = useState<string | null>(null)

  // Upload state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([])
  const [uploadCategory, setUploadCategory] = useState('Receipts')
  const [isDragOver, setIsDragOver] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<DocumentRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('dashboard-theme') as DashboardTheme
    if (saved) setTheme(saved)
  }, [])

  const classes = getThemeClasses(theme)

  // -------------------------------------------------------------------
  // Fetch documents
  // -------------------------------------------------------------------

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (filterCategory !== 'all') params.set('category', filterCategory)
      if (searchQuery.trim()) params.set('search', searchQuery.trim())
      const qs = params.toString()
      const url = qs ? `/api/documents?${qs}` : '/api/documents'

      const res = await fetch(url)
      if (!res.ok) throw new Error('Fetch failed')
      const data = await res.json()
      setDocuments(Array.isArray(data) ? data : [])
    } catch {
      setDocuments([])
    } finally {
      setIsLoading(false)
    }
  }, [filterCategory, searchQuery])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  // -------------------------------------------------------------------
  // Build folder structure
  // -------------------------------------------------------------------

  const monthFolders = useMemo(() => {
    const map = new Map<string, DocumentRecord[]>()
    for (const doc of documents) {
      const key = getMonthKey(doc.created_at)
      const existing = map.get(key) || []
      map.set(key, [...existing, doc])
    }
    // Sort keys descending (newest first)
    const sorted = Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]))
    return sorted
  }, [documents])

  const activeFolderDocs: DocumentRecord[] = useMemo(() => {
    if (!activeFolder) return [] as DocumentRecord[]
    const match = monthFolders.find(([key]) => key === activeFolder)
    return match ? match[1] : ([] as DocumentRecord[])
  }, [activeFolder, monthFolders])

  // -------------------------------------------------------------------
  // Upload handlers
  // -------------------------------------------------------------------

  const addFilesToQueue = useCallback(
    (files: FileList | File[]) => {
      const items: UploadItem[] = Array.from(files).map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        category: uploadCategory,
        progress: 0,
        status: 'pending' as const,
      }))
      setUploadQueue((prev) => [...prev, ...items])
      if (!showUploadModal) setShowUploadModal(true)
    },
    [uploadCategory, showUploadModal]
  )

  const removeFromQueue = useCallback((id: string) => {
    setUploadQueue((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const uploadSingleFile = useCallback(
    async (item: UploadItem) => {
      setUploadQueue((prev) =>
        prev.map((u) =>
          u.id === item.id ? { ...u, status: 'uploading' as const, progress: 10 } : u
        )
      )

      try {
        const formData = new FormData()
        formData.append('file', item.file)
        formData.append('category', item.category)

        // Simulate progress while waiting
        const progressInterval = setInterval(() => {
          setUploadQueue((prev) =>
            prev.map((u) =>
              u.id === item.id && u.progress < 85
                ? { ...u, progress: u.progress + Math.random() * 15 }
                : u
            )
          )
        }, 300)

        const res = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        })

        clearInterval(progressInterval)

        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: 'Upload failed' }))
          throw new Error(body.error || 'Upload failed')
        }

        setUploadQueue((prev) =>
          prev.map((u) =>
            u.id === item.id
              ? { ...u, status: 'done' as const, progress: 100 }
              : u
          )
        )
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        setUploadQueue((prev) =>
          prev.map((u) =>
            u.id === item.id
              ? { ...u, status: 'error' as const, error: message }
              : u
          )
        )
      }
    },
    []
  )

  const uploadAll = useCallback(async () => {
    const pending = uploadQueue.filter((u) => u.status === 'pending')
    // Upload one at a time to avoid overwhelming the server
    for (const item of pending) {
      await uploadSingleFile(item)
    }
    // Refresh document list after all uploads
    await fetchDocuments()
  }, [uploadQueue, uploadSingleFile, fetchDocuments])

  const closeUploadModal = useCallback(() => {
    setShowUploadModal(false)
    setUploadQueue([])
  }, [])

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      if (e.dataTransfer.files.length > 0) {
        addFilesToQueue(e.dataTransfer.files)
      }
    },
    [addFilesToQueue]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFilesToQueue(e.target.files)
      }
      // Reset the input so the same file can be selected again
      e.target.value = ''
    },
    [addFilesToQueue]
  )

  // -------------------------------------------------------------------
  // Delete handler
  // -------------------------------------------------------------------

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/documents/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Delete failed')
      // Remove from local state immediately
      setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch {
      // Keep the modal open so the user sees the error state
    } finally {
      setIsDeleting(false)
    }
  }, [deleteTarget])

  // -------------------------------------------------------------------
  // Download handler
  // -------------------------------------------------------------------

  const handleDownload = useCallback(async (doc: DocumentRecord) => {
    try {
      // Get a fresh signed URL from the detail endpoint
      const res = await fetch(`/api/documents/${doc.id}`)
      if (!res.ok) throw new Error('Failed to get download URL')
      const data = await res.json()
      const url = data.file_url

      // Open in new tab -- the signed URL triggers a browser download for non-image types
      const link = document.createElement('a')
      link.href = url
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.download = doc.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch {
      // Silently fail -- in production you could show a toast
    }
  }, [])

  // -------------------------------------------------------------------
  // Stats
  // -------------------------------------------------------------------

  const totalSize = documents.reduce((sum, d) => sum + (d.file_size || 0), 0)
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    for (const doc of documents) {
      const cat = doc.category || 'Other'
      map.set(cat, (map.get(cat) || 0) + 1)
    }
    return map
  }, [documents])

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up"
        style={{ animationDelay: '0ms' }}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 mt-1">
            Upload, organize, and manage your ministry documents and receipts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium transition-colors sm:hidden"
          >
            <Camera className="w-4 h-4" />
            Photo
          </button>
          <button
            onClick={() => {
              setShowUploadModal(true)
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl font-medium shadow-card transition-all hover:shadow-card-hover',
              classes.buttonPrimary
            )}
          >
            <Plus className="w-5 h-5" />
            Upload
          </button>
        </div>
        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Quick Stats */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up"
        style={{ animationDelay: '80ms' }}
      >
        <StatCard
          icon={FileText}
          label="Total Documents"
          value={documents.length}
          color="purple"
        />
        <StatCard
          icon={HardDrive}
          label="Storage Used"
          value={formatBytes(totalSize)}
          color="sky"
          isString
        />
        <StatCard
          icon={FolderOpen}
          label="Monthly Folders"
          value={monthFolders.length}
          color="emerald"
        />
        <StatCard
          icon={Tag}
          label="Categories"
          value={categoryBreakdown.size}
          color="amber"
        />
      </div>

      {/* Search and Filter Bar */}
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-card p-4 animate-fade-up"
        style={{ animationDelay: '160ms' }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 text-sm transition-all bg-slate-50 focus:bg-white"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 text-sm bg-slate-50 focus:bg-white transition-all min-w-[180px]"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Back button when inside a folder */}
      {activeFolder && (
        <button
          onClick={() => setActiveFolder(null)}
          className="flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800 transition-colors animate-fade-in"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to all folders
        </button>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && documents.length === 0 && (
        <div
          className="bg-white rounded-2xl border border-slate-200 shadow-card p-12 text-center animate-fade-up"
          style={{ animationDelay: '240ms' }}
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No documents yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Upload receipts, tax documents, meeting minutes, and other ministry files to keep everything organized.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className={cn(
              'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium shadow-card',
              classes.buttonPrimary
            )}
          >
            <Upload className="w-4 h-4" />
            Upload your first document
          </button>
        </div>
      )}

      {/* Folder Grid (when not inside a folder) */}
      {!isLoading && documents.length > 0 && !activeFolder && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-up"
          style={{ animationDelay: '240ms' }}
        >
          {monthFolders.map(([key, docs], index) => (
            <button
              key={key}
              onClick={() => setActiveFolder(key)}
              className="group bg-white rounded-2xl border border-slate-200 shadow-card p-5 text-left hover:shadow-card-hover hover:border-primary-200 transition-all animate-fade-up"
              style={{ animationDelay: `${280 + index * 60}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center group-hover:from-primary-200 group-hover:to-indigo-200 transition-colors">
                  <FolderOpen className="w-6 h-6 text-primary-600" />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors mt-1" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {getMonthLabel(key)}
              </h3>
              <p className="text-sm text-slate-500">
                {docs.length} {docs.length === 1 ? 'document' : 'documents'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {formatBytes(docs.reduce((sum: number, d: DocumentRecord) => sum + (d.file_size || 0), 0))}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Document List (inside a folder) */}
      {!isLoading && activeFolder && activeFolderDocs.length > 0 && (
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-lg font-semibold text-gray-900">
            {getMonthLabel(activeFolder)}
            <span className="text-sm font-normal text-slate-500 ml-2">
              ({activeFolderDocs.length} {activeFolderDocs.length === 1 ? 'file' : 'files'})
            </span>
          </h2>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeFolderDocs.map((doc, idx) => {
                  const Icon = getFileIcon(doc.type)
                  return (
                    <tr
                      key={doc.id}
                      className="group hover:bg-primary-50/30 transition-colors animate-fade-up"
                      style={{ animationDelay: `${idx * 40}ms` }}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {isImageType(doc.type) && doc.file_url ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                              <img
                                src={doc.file_url}
                                alt={doc.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  ;(e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-50 to-indigo-50 border border-primary-100 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-primary-500" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate max-w-[260px]">
                              {doc.name}
                            </p>
                            <p className="text-xs text-slate-400 capitalize">
                              {doc.type}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            'inline-flex px-2.5 py-1 text-xs font-medium rounded-full',
                            getCategoryBadge(doc.category)
                          )}
                        >
                          {doc.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">
                        {formatBytes(doc.file_size || 0)}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">
                        {formatDateShort(doc.created_at)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          {isImageType(doc.type) && doc.file_url && (
                            <button
                              onClick={() => window.open(doc.file_url, '_blank')}
                              className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDownload(doc)}
                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(doc)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {activeFolderDocs.map((doc, idx) => {
              const Icon = getFileIcon(doc.type)
              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-card p-4 animate-fade-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    {isImageType(doc.type) && doc.file_url ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                        <img
                          src={doc.file_url}
                          alt={doc.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-50 to-indigo-50 border border-primary-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={cn(
                            'inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full',
                            getCategoryBadge(doc.category)
                          )}
                        >
                          {doc.category}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatBytes(doc.file_size || 0)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDateShort(doc.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-slate-100">
                    {isImageType(doc.type) && doc.file_url && (
                      <button
                        onClick={() => window.open(doc.file_url, '_blank')}
                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(doc)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty folder state */}
      {!isLoading && activeFolder && activeFolderDocs.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-12 text-center animate-fade-up">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">This folder is empty</p>
        </div>
      )}

      {/* ============================================================= */}
      {/* Upload Modal */}
      {/* ============================================================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={closeUploadModal}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Upload Documents
              </h2>
              <button
                onClick={closeUploadModal}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5">
              {/* Category selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 bg-slate-50 focus:bg-white transition-all"
                >
                  {CATEGORIES.filter((c) => c.value !== 'all').map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
                  isDragOver
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-slate-200 hover:border-primary-300 hover:bg-primary-50/30'
                )}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-7 h-7 text-primary-500" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {isDragOver ? 'Drop files here' : 'Drag and drop files here'}
                </p>
                <p className="text-xs text-slate-400">
                  or click to browse -- PDF, images, Word, Excel, CSV
                </p>

                {/* Camera button for mobile */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    cameraInputRef.current?.click()
                  }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors sm:hidden"
                >
                  <Camera className="w-4 h-4" />
                  Take Photo
                </button>
              </div>

              {/* Upload Queue */}
              {uploadQueue.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-700">
                    Files ({uploadQueue.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {uploadQueue.map((item) => (
                      <UploadQueueItem
                        key={item.id}
                        item={item}
                        onRemove={removeFromQueue}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-5 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
              <button
                onClick={closeUploadModal}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={uploadAll}
                disabled={uploadQueue.filter((u) => u.status === 'pending').length === 0}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium shadow-card transition-all disabled:opacity-40 disabled:cursor-not-allowed',
                  classes.buttonPrimary
                )}
              >
                <Upload className="w-4 h-4" />
                Upload {uploadQueue.filter((u) => u.status === 'pending').length > 0
                  ? `(${uploadQueue.filter((u) => u.status === 'pending').length})`
                  : 'All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* Delete Confirmation Modal */}
      {/* ============================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm animate-scale-in p-6">
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Delete Document
            </h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Are you sure you want to delete{' '}
              <span className="font-medium text-gray-700">
                "{deleteTarget.name}"
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-rose-600 text-white hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-Components
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  isString = false,
}: {
  icon: typeof FileText
  label: string
  value: number | string
  color: 'purple' | 'sky' | 'emerald' | 'amber'
  isString?: boolean
}) {
  const colorMap = {
    purple: {
      bg: 'bg-primary-50',
      iconBg: 'bg-primary-100',
      iconText: 'text-primary-600',
      valueText: 'text-primary-700',
    },
    sky: {
      bg: 'bg-sky-50',
      iconBg: 'bg-sky-100',
      iconText: 'text-sky-600',
      valueText: 'text-sky-700',
    },
    emerald: {
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      iconText: 'text-emerald-600',
      valueText: 'text-emerald-700',
    },
    amber: {
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconText: 'text-amber-600',
      valueText: 'text-amber-700',
    },
  }

  const c = colorMap[color]

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-4 hover:shadow-card-hover transition-shadow">
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', c.iconBg)}>
          <Icon className={cn('w-5 h-5', c.iconText)} />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {label}
          </p>
          <p className={cn('text-xl font-bold mt-0.5', c.valueText)}>
            {isString ? value : typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
      </div>
    </div>
  )
}

function UploadQueueItem({
  item,
  onRemove,
}: {
  item: UploadItem
  onRemove: (id: string) => void
}) {
  const Icon = item.file.type.startsWith('image/') ? ImageIcon : FileText

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {item.file.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-slate-400">
            {formatBytes(item.file.size)}
          </p>
          {item.status === 'error' && (
            <p className="text-xs text-rose-500 truncate">
              {item.error}
            </p>
          )}
        </div>
        {/* Progress bar */}
        {(item.status === 'uploading' || item.status === 'done') && (
          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5">
            <div
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                item.status === 'done' ? 'bg-emerald-500' : 'bg-primary-500'
              )}
              style={{ width: `${Math.min(item.progress, 100)}%` }}
            />
          </div>
        )}
      </div>
      <div className="flex-shrink-0">
        {item.status === 'done' ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        ) : item.status === 'uploading' ? (
          <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
        ) : item.status === 'error' ? (
          <button
            onClick={() => onRemove(item.id)}
            className="p-1 rounded hover:bg-rose-50 transition-colors"
          >
            <X className="w-4 h-4 text-rose-500" />
          </button>
        ) : (
          <button
            onClick={() => onRemove(item.id)}
            className="p-1 rounded hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>
    </div>
  )
}
