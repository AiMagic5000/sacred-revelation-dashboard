import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getCurrentOrganization, getCurrentUserId } from '@/lib/supabase-server'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const org = await getCurrentOrganization()
    const userId = await getCurrentUserId()
    const supabase = createServerClient()

    // Fetch the document first to get storage_path and verify ownership
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', params.id)
      .eq('organization_id', org.id)
      .single()

    if (fetchError || !doc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Remove file from storage
    if (doc.storage_path) {
      await supabase.storage.from('documents').remove([doc.storage_path])
    }

    // Delete the database record
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', org.id)

    if (deleteError) {
      throw new Error(`Delete failed: ${deleteError.message}`)
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      organization_id: org.id,
      action: 'document_deleted',
      description: `Document "${doc.name}" deleted`,
      user_id: userId,
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Delete failed'
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const org = await getCurrentOrganization()
    const supabase = createServerClient()

    const { data: doc, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', params.id)
      .eq('organization_id', org.id)
      .single()

    if (error || !doc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // If storage_path exists, generate a fresh signed URL for download
    if (doc.storage_path) {
      const { data: urlData } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.storage_path, 3600) // 1 hour

      if (urlData?.signedUrl) {
        return NextResponse.json({ ...doc, file_url: urlData.signedUrl })
      }
    }

    return NextResponse.json(doc)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch document'
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
