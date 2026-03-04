'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  FileText,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield,
  Upload,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  Eye,
  Trash2,
  Users,
  Printer,
  FolderOpen,
  Camera,
  CheckCircle2,
} from 'lucide-react'
import { cn, formatBytes } from '@/lib/utils'
import { getThemeClasses } from '@/lib/themes'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

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

const CHECKLIST_DESCRIPTIONS: Record<string, string> = {
  'Trust Indenture': 'Signed copy of the ministry trust indenture document establishing the 508(c)(1)(A) organization.',
  'IRS Determination Letter': 'IRS recognition letter or self-declaration documentation for tax-exempt status.',
  'Annual Financial Statement': 'Year-end financial statement summarizing all income and expenses.',
  'Meeting Minutes': 'Annual meeting minutes documenting governance decisions and elder board actions.',
  'Elder Board Resolutions': 'Formal resolutions passed by the elder board during the year.',
  'Donor Acknowledgment Letters': 'Written acknowledgment letters sent to donors for tax deduction purposes.',
  'State Filing Receipts': 'State-level filing receipts, annual report confirmations, or registration renewals.',
  'Form 990-N Confirmation': 'E-Postcard filing confirmation (if applicable -- 508(c)(1)(A) orgs are generally exempt).',
}

const RENEWAL_CATEGORIES = new Set([
  'Annual Financial Statement',
  'Meeting Minutes',
  'Elder Board Resolutions',
  'State Filing Receipts',
  'Form 990-N Confirmation',
])

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChecklistItem {
  category: string
  status: 'complete' | 'partial' | 'missing'
  documentCount: number
  allTimeCount: number
  latestUpload: string | null
  documents: DocRecord[]
}

interface DocRecord {
  id: string
  name: string
  type: string
  file_url: string
  file_size: number
  category: string
  created_at: string
  storage_path?: string
}

interface DonorAcknowledgment {
  name: string
  total: number
  count: number
  email?: string
  receipts: string[]
  donations: Array<{
    amount: number
    date: string
    receipt_number?: string
    payment_method?: string
  }>
}

interface TrustInfo {
  ministry_name?: string
  ein_number?: string
  address?: string
  state_of_formation?: string
}

interface TaxDocumentsData {
  year: number
  availableYears: number[]
  checklist: ChecklistItem[]
  compliance: {
    completeCount: number
    partialCount: number
    missingCount: number
    total: number
    percentage: number
  }
  donorAcknowledgments: DonorAcknowledgment[]
  trustData: TrustInfo | null
  allDocuments: DocRecord[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const classes = getThemeClasses('sacred')

function formatCurrencyFull(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getComplianceColor(
  status: 'complete' | 'partial' | 'missing'
): { text: string; bg: string; border: string; dot: string } {
  switch (status) {
    case 'complete':
      return {
        text: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      }
    case 'partial':
      return {
        text: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      }
    case 'missing':
      return {
        text: 'text-rose-700',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
      }
  }
}

function getStatusIcon(status: 'complete' | 'partial' | 'missing') {
  switch (status) {
    case 'complete':
      return CheckCircle
    case 'partial':
      return Clock
    case 'missing':
      return AlertTriangle
  }
}

function getStatusLabel(status: 'complete' | 'partial' | 'missing') {
  switch (status) {
    case 'complete':
      return 'Complete'
    case 'partial':
      return 'Older Version'
    case 'missing':
      return 'Missing'
  }
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function TaxDocumentsPage() {
  const [data, setData] = useState<TaxDocumentsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showDonorLetters, setShowDonorLetters] = useState(false)
  const [generatingLetter, setGeneratingLetter] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DocRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/tax-documents?year=${selectedYear}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const result = await res.json()
      setData(result)
    } catch {
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [selectedYear])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Upload file to a specific category
  const handleUpload = useCallback(
    async (file: File, category: string) => {
      setUploading(true)
      setUploadProgress(10)
      setUploadingCategory(category)

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('category', category)

        const progressInterval = setInterval(() => {
          setUploadProgress((prev) =>
            prev < 85 ? prev + Math.random() * 15 : prev
          )
        }, 300)

        const res = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        })

        clearInterval(progressInterval)
        setUploadProgress(100)

        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: 'Upload failed' }))
          throw new Error(body.error || 'Upload failed')
        }

        // Refresh data
        await fetchData()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed'
        alert(message)
      } finally {
        setUploading(false)
        setUploadProgress(0)
        setUploadingCategory(null)
      }
    },
    [fetchData]
  )

  // File input change handler
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
      if (e.target.files && e.target.files[0]) {
        handleUpload(e.target.files[0], category)
      }
      e.target.value = ''
    },
    [handleUpload]
  )

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent, category: string) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(category)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, category: string) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(null)
      if (e.dataTransfer.files.length > 0) {
        handleUpload(e.dataTransfer.files[0], category)
      }
    },
    [handleUpload]
  )

  // Delete document
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/documents/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Delete failed')
      await fetchData()
      setDeleteTarget(null)
    } catch {
      alert('Failed to delete document')
    } finally {
      setIsDeleting(false)
    }
  }, [deleteTarget, fetchData])

  // Generate donor acknowledgment letter
  const handleGenerateLetter = useCallback(
    (donor: DonorAcknowledgment) => {
      setGeneratingLetter(donor.name)

      const trustName = data?.trustData?.ministry_name || 'Sacred Revelation Ministry Trust'
      const ein = data?.trustData?.ein_number || '[EIN on file]'
      const address = data?.trustData?.address || '[Ministry Address]'
      const year = data?.year || new Date().getFullYear()

      const letterContent = [
        trustName,
        address,
        '',
        `Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
        '',
        `Dear ${donor.name},`,
        '',
        `Thank you for your generous contributions to ${trustName} during the ${year} calendar year.`,
        '',
        `This letter serves as your official acknowledgment for tax purposes. ${trustName} is a 508(c)(1)(A) tax-exempt religious organization. No goods or services were provided in exchange for your contributions unless otherwise noted below.`,
        '',
        'Contribution Summary:',
        '---',
        ...donor.donations.map(
          (d) =>
            `  Date: ${new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}  |  Amount: ${formatCurrencyFull(d.amount)}  |  Method: ${d.payment_method || 'N/A'}  |  Receipt: ${d.receipt_number || 'N/A'}`
        ),
        '---',
        `Total Contributions: ${formatCurrencyFull(donor.total)}`,
        `Number of Gifts: ${donor.count}`,
        '',
        `EIN: ${ein}`,
        `Organization Status: 508(c)(1)(A) Tax-Exempt Religious Organization`,
        '',
        'Please retain this letter for your tax records. If you have questions about your contributions, contact us at the address above.',
        '',
        'Blessings,',
        trustName,
        'Ministry Trust Administration',
      ].join('\n')

      // Create and download the letter as a text file
      const blob = new Blob([letterContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Donor-Acknowledgment-${donor.name.replace(/\s+/g, '-')}-${year}.txt`
      a.click()
      URL.revokeObjectURL(url)

      setTimeout(() => setGeneratingLetter(null), 1000)
    },
    [data]
  )

  // Available years
  const availableYears = data?.availableYears || [new Date().getFullYear()]
  const compliance = data?.compliance || {
    completeCount: 0,
    partialCount: 0,
    missingCount: 0,
    total: 8,
    percentage: 0,
  }

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-700" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', classes.bgLight)}>
              <FileText className={cn('w-5 h-5', classes.textPrimary)} />
            </div>
            Tax Documents
          </h1>
          <p className="text-gray-500 mt-1 ml-11 text-sm">
            508(c)(1)(A) compliance documents, filings, and donor acknowledgments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-700/40 focus:border-purple-500"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Compliance Stats */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up"
        style={{ animationDelay: '80ms' }}
      >
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className={cn('p-3 rounded-lg', classes.bgLight)}>
              <FolderOpen className={cn('w-6 h-6', classes.textPrimary)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{compliance.total}</p>
              <p className="text-sm text-gray-500">Required Documents</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-emerald-100">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {compliance.completeCount}
              </p>
              <p className="text-sm text-gray-500">Complete</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-amber-100">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {compliance.partialCount + compliance.missingCount}
              </p>
              <p className="text-sm text-gray-500">Needs Attention</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {compliance.percentage}%
              </p>
              <p className="text-sm text-gray-500">Compliance Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Progress Bar */}
      <div
        className="bg-white rounded-xl border border-gray-200 p-5 animate-fade-up"
        style={{ animationDelay: '120ms' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Document Compliance - {selectedYear}
          </h2>
          <span className="text-sm font-medium text-gray-600">
            {compliance.completeCount} of {compliance.total} complete
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              compliance.percentage >= 80
                ? 'bg-emerald-500'
                : compliance.percentage >= 50
                ? 'bg-amber-500'
                : 'bg-rose-500'
            )}
            style={{ width: `${compliance.percentage}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-gray-500">
              Complete ({compliance.completeCount})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs text-gray-500">
              Older Version ({compliance.partialCount})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-xs text-gray-500">
              Missing ({compliance.missingCount})
            </span>
          </div>
        </div>
      </div>

      {/* 508(c)(1)(A) Exemption Info */}
      <div
        className={cn('rounded-xl p-5 animate-fade-up', classes.bgLight)}
        style={{ animationDelay: '160ms' }}
      >
        <div className="flex items-start gap-4">
          <div className={cn('p-3 rounded-lg flex-shrink-0', classes.bgPrimary)}>
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              508(c)(1)(A) Tax Exempt Status
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              As a 508(c)(1)(A) religious organization, you are automatically
              exempt from federal income tax and are NOT required to file Form
              990. However, maintaining proper documentation supports your
              exempt status and is considered best practice for ministry
              governance.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-gray-700">No Form 990 filing required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Document Checklist */}
      <div
        className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-fade-up"
        style={{ animationDelay: '240ms' }}
      >
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            Required Documents Checklist
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload and track each required document for {selectedYear}
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {(data?.checklist || []).map((item) => {
            const colors = getComplianceColor(item.status)
            const StatusIcon = getStatusIcon(item.status)
            const isExpanded = expandedCategory === item.category
            const isUploading = uploadingCategory === item.category
            const isDragging = isDragOver === item.category
            const needsRenewal = RENEWAL_CATEGORIES.has(item.category)

            return (
              <div key={item.category}>
                {/* Category Header */}
                <div
                  className={cn(
                    'flex items-center justify-between px-5 py-4 cursor-pointer transition-colors',
                    isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50/50',
                    isDragging && 'bg-purple-50'
                  )}
                  onClick={() =>
                    setExpandedCategory(isExpanded ? null : item.category)
                  }
                  onDragOver={(e) => handleDragOver(e, item.category)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, item.category)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className={cn(
                        'p-2 rounded-lg flex-shrink-0',
                        colors.bg
                      )}
                    >
                      <StatusIcon
                        className={cn('w-5 h-5', colors.text)}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {item.category}
                        </p>
                        {needsRenewal && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                            Annual
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {CHECKLIST_DESCRIPTIONS[item.category] || ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    {/* Status badge */}
                    <div className="text-right hidden sm:block">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full',
                          colors.bg,
                          colors.text
                        )}
                      >
                        <div
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            colors.dot
                          )}
                        />
                        {getStatusLabel(item.status)}
                      </span>
                      {item.latestUpload && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Updated {formatDateShort(item.latestUpload)}
                        </p>
                      )}
                    </div>

                    {/* Upload button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setUploadingCategory(item.category)
                        fileInputRef.current?.click()
                      }}
                      disabled={uploading}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        'text-gray-400 hover:text-purple-600 hover:bg-purple-50',
                        'disabled:opacity-50'
                      )}
                      title={`Upload ${item.category}`}
                    >
                      <Upload className="w-4 h-4" />
                    </button>

                    {/* Expand/collapse */}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-5 pb-4 bg-gray-50/50">
                    {/* Upload zone */}
                    <div
                      onDragOver={(e) => handleDragOver(e, item.category)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, item.category)}
                      className={cn(
                        'border-2 border-dashed rounded-xl p-4 text-center mb-3 transition-all cursor-pointer',
                        isDragging
                          ? 'border-purple-400 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30'
                      )}
                      onClick={() => {
                        setUploadingCategory(item.category)
                        fileInputRef.current?.click()
                      }}
                    >
                      {isUploading && uploading ? (
                        <div className="space-y-2">
                          <Loader2 className="w-6 h-6 text-purple-500 animate-spin mx-auto" />
                          <p className="text-sm text-gray-600">Uploading...</p>
                          <div className="w-48 mx-auto bg-gray-200 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-purple-500 transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">
                            {isDragging
                              ? 'Drop file here'
                              : 'Drag and drop or click to upload'}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Uploaded documents list */}
                    {item.documents.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-600">
                          Uploaded documents ({item.documents.length})
                        </p>
                        {item.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <FileText className="w-4 h-4 text-purple-500 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate max-w-[280px]">
                                  {doc.name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-gray-400">
                                    {formatBytes(doc.file_size || 0)}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    {formatDateShort(doc.created_at)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {doc.file_url && (
                                <button
                                  onClick={() =>
                                    window.open(doc.file_url, '_blank')
                                  }
                                  className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="View"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => setDeleteTarget(doc)}
                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : item.allTimeCount > 0 ? (
                      <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-3 border border-amber-200">
                        You have {item.allTimeCount} document(s) from other
                        years but none uploaded for {selectedYear}. Upload a
                        current version to mark this as complete.
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 text-center py-2">
                        No documents uploaded for this category yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Donor Acknowledgment Letters */}
      <div
        className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-fade-up"
        style={{ animationDelay: '320ms' }}
      >
        <button
          onClick={() => setShowDonorLetters(!showDonorLetters)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Donor Acknowledgment Letters
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Generate tax receipt letters for {selectedYear} donors (
                {data?.donorAcknowledgments?.length || 0} donors)
              </p>
            </div>
          </div>
          {showDonorLetters ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {showDonorLetters && (
          <div className="border-t border-gray-200">
            {(data?.donorAcknowledgments || []).length === 0 ? (
              <div className="p-10 text-center">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  No completed donations found for {selectedYear}.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Record donations first, then generate acknowledgment letters.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {(data?.donorAcknowledgments || []).map((donor) => (
                  <div
                    key={donor.name}
                    className="flex items-center justify-between px-5 py-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          'w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0',
                          classes.bgPrimary
                        )}
                      >
                        {donor.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {donor.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">
                            {donor.count} gift{donor.count !== 1 ? 's' : ''}
                          </span>
                          {donor.email && (
                            <span className="text-xs text-gray-400">
                              {donor.email}
                            </span>
                          )}
                          {donor.receipts.length > 0 && (
                            <span className="text-[10px] text-gray-400">
                              Receipts: {donor.receipts.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrencyFull(donor.total)}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          total in {selectedYear}
                        </p>
                      </div>
                      <button
                        onClick={() => handleGenerateLetter(donor)}
                        disabled={generatingLetter === donor.name}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                          generatingLetter === donor.name
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                        )}
                      >
                        {generatingLetter === donor.name ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Generated
                          </>
                        ) : (
                          <>
                            <Printer className="w-3.5 h-3.5" />
                            Generate Letter
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Generate all button */}
                <div className="px-5 py-4 bg-gray-50/50">
                  <button
                    onClick={() => {
                      for (const donor of data?.donorAcknowledgments || []) {
                        handleGenerateLetter(donor)
                      }
                    }}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium',
                      classes.buttonPrimary
                    )}
                  >
                    <Download className="w-4 h-4" />
                    Generate All Letters ({data?.donorAcknowledgments?.length || 0})
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Important Dates */}
      <div
        className="bg-white rounded-xl border border-gray-200 p-5 animate-fade-up"
        style={{ animationDelay: '400ms' }}
      >
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className={cn('w-5 h-5', classes.textPrimary)} />
          Compliance Calendar
        </h3>
        <div className="space-y-3">
          <DateRow
            icon={Shield}
            label="Trust Indenture Review"
            detail="Review and update annually"
            color="blue"
          />
          <DateRow
            icon={FileText}
            label="Annual Financial Statement"
            detail={`Due by March 31, ${selectedYear + 1}`}
            color="purple"
          />
          <DateRow
            icon={Users}
            label="Donor Acknowledgment Letters"
            detail={`Must be sent by January 31, ${selectedYear + 1}`}
            color="indigo"
          />
          <DateRow
            icon={FolderOpen}
            label="Meeting Minutes"
            detail="At least one documented annual meeting"
            color="gray"
          />
          <DateRow
            icon={Clock}
            label="State Filing Renewals"
            detail="Varies by state -- check your state requirements"
            color="amber"
          />
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={(e) => {
          if (uploadingCategory) {
            handleFileSelect(e, uploadingCategory)
          }
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (uploadingCategory) {
            handleFileSelect(e, uploadingCategory)
          }
        }}
      />

      {/* Delete Confirmation Modal */}
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
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete{' '}
              <span className="font-medium text-gray-700">
                "{deleteTarget.name}"
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
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

function DateRow({
  icon: Icon,
  label,
  detail,
  color,
}: {
  icon: typeof Shield
  label: string
  detail: string
  color: 'blue' | 'purple' | 'indigo' | 'gray' | 'amber'
}) {
  const colorMap = {
    blue: 'bg-blue-50 border-blue-200 text-blue-500',
    purple: 'bg-purple-50 border-purple-200 text-purple-500',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-500',
    gray: 'bg-gray-50 border-gray-200 text-gray-400',
    amber: 'bg-amber-50 border-amber-200 text-amber-500',
  }
  const classes = colorMap[color]
  const [bg, border, text] = classes.split(' ')

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-lg border',
        bg,
        border
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn('w-5 h-5', text)} />
        <span className="text-sm font-medium text-gray-900">{label}</span>
      </div>
      <span className="text-xs text-gray-500">{detail}</span>
    </div>
  )
}
