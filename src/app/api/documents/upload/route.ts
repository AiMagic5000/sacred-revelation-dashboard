import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getCurrentOrganization, getCurrentUserId } from '@/lib/supabase-server'

async function ensureBucketExists(supabase: ReturnType<typeof createServerClient>) {
  const { data: buckets } = await supabase.storage.listBuckets()
  const exists = buckets?.some((b) => b.name === 'documents')

  if (!exists) {
    const { error } = await supabase.storage.createBucket('documents', {
      public: false,
      fileSizeLimit: 52428800, // 50 MB
      allowedMimeTypes: [
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
      ],
    })
    if (error) {
      throw new Error(`Failed to create storage bucket: ${error.message}`)
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const org = await getCurrentOrganization()
    const userId = await getCurrentUserId()
    const supabase = createServerClient()

    await ensureBucketExists(supabase)

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const category = (formData.get('category') as string) || 'Other'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Build a safe storage path: org_id/YYYY-MM/filename
    const now = new Date()
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const uniqueName = `${Date.now()}-${safeFileName}`
    const storagePath = `${org.id}/${yearMonth}/${uniqueName}`

    // Read the file into a buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`)
    }

    // Build a signed URL (valid for 10 years -- effectively permanent for private bucket)
    const { data: urlData } = await supabase.storage
      .from('documents')
      .createSignedUrl(storagePath, 315360000)

    const fileUrl = urlData?.signedUrl || storagePath

    // Determine file type from MIME
    const fileType = deriveFileType(file.type)

    // Insert metadata record
    const { data: doc, error: dbError } = await supabase
      .from('documents')
      .insert({
        organization_id: org.id,
        name: file.name,
        type: fileType,
        file_url: fileUrl,
        file_size: file.size,
        uploaded_by: userId,
        category,
        storage_path: storagePath,
      })
      .select()
      .single()

    if (dbError) {
      // Clean up the uploaded file if DB insert fails
      await supabase.storage.from('documents').remove([storagePath])
      throw new Error(`Database insert failed: ${dbError.message}`)
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      organization_id: org.id,
      action: 'document_uploaded',
      description: `Document "${file.name}" uploaded (${formatBytes(file.size)})`,
      user_id: userId,
    })

    return NextResponse.json(doc, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function deriveFileType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType === 'application/pdf') return 'pdf'
  if (
    mimeType.includes('word') ||
    mimeType.includes('document')
  ) {
    return 'document'
  }
  if (
    mimeType.includes('excel') ||
    mimeType.includes('spreadsheet') ||
    mimeType === 'text/csv'
  ) {
    return 'spreadsheet'
  }
  return 'other'
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
