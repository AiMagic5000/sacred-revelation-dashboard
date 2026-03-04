import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Sacred Revelation public donation endpoint.
 * No authentication required -- this is for the public donate page.
 */

const SACRED_REVELATION_ORG_ID = '707b4095-e322-455d-a7ad-176a1ceffb82'

const VALID_CATEGORIES = [
  'general',
  'building',
  'food',
  'healing',
  'music',
  'outreach',
  'youth',
  'missions',
]

const VALID_DONATION_TYPES = ['money', 'time', 'resources']
const VALID_FREQUENCIES = ['one-time', 'recurring']
const VALID_DELIVERY = ['pickup', 'dropoff']

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Supabase configuration is missing')
  }

  return createClient(url, key)
}

function generateReceiptNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `SR-${timestamp}-${random}`
}

function sanitizeString(value: unknown, maxLength = 500): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // ── Validate required fields ───────────────────────
    const donorName = sanitizeString(body.donor_name, 200)
    const donorEmail = sanitizeString(body.donor_email, 200)
    const category = sanitizeString(body.category, 50)
    const donationType = sanitizeString(body.donation_type, 20)
    const frequency = sanitizeString(body.frequency, 20)

    if (!donorName) {
      return NextResponse.json({ error: 'Donor name is required.' }, { status: 400 })
    }

    if (!donorEmail || !isValidEmail(donorEmail)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Please select a valid ministry program.' }, { status: 400 })
    }

    if (!VALID_DONATION_TYPES.includes(donationType)) {
      return NextResponse.json({ error: 'Invalid donation type.' }, { status: 400 })
    }

    if (!VALID_FREQUENCIES.includes(frequency)) {
      return NextResponse.json({ error: 'Invalid frequency.' }, { status: 400 })
    }

    // ── Optional fields ────────────────────────────────
    const donorPhone = sanitizeString(body.donor_phone, 30)
    const message = sanitizeString(body.message, 1000)
    const amount = typeof body.amount === 'number' && body.amount >= 0 ? body.amount : 0
    const volunteerHours = typeof body.volunteer_hours === 'number' && body.volunteer_hours > 0 ? body.volunteer_hours : null
    const resourceDescription = sanitizeString(body.resource_description, 2000)
    const estimatedValue = typeof body.estimated_value === 'number' && body.estimated_value >= 0 ? body.estimated_value : null
    const deliveryPreference = VALID_DELIVERY.includes(sanitizeString(body.delivery_preference, 20))
      ? sanitizeString(body.delivery_preference, 20)
      : null

    // ── Money donations need a positive amount ─────────
    if (donationType === 'money' && amount <= 0) {
      return NextResponse.json({ error: 'Please enter a valid donation amount.' }, { status: 400 })
    }

    // ── Time donations need volunteer hours ─────────────
    if (donationType === 'time' && (!volunteerHours || volunteerHours <= 0)) {
      return NextResponse.json({ error: 'Please enter the number of volunteer hours.' }, { status: 400 })
    }

    // ── Resource donations need a description ───────────
    if (donationType === 'resources' && !resourceDescription) {
      return NextResponse.json({ error: 'Please describe the items you wish to donate.' }, { status: 400 })
    }

    // ── Generate receipt ───────────────────────────────
    const receiptNumber = generateReceiptNumber()

    // ── Build notes field with all extra info ──────────
    const notesParts: string[] = []
    notesParts.push(`Donation Type: ${donationType}`)
    notesParts.push(`Category: ${category}`)

    if (donationType === 'time' && volunteerHours) {
      notesParts.push(`Volunteer Hours/Week: ${volunteerHours}`)
    }

    if (donationType === 'resources') {
      notesParts.push(`Items: ${resourceDescription}`)
      if (estimatedValue !== null) {
        notesParts.push(`Estimated Value: $${estimatedValue}`)
      }
      if (deliveryPreference) {
        notesParts.push(`Delivery: ${deliveryPreference}`)
      }
    }

    if (donorPhone) {
      notesParts.push(`Phone: ${donorPhone}`)
    }

    if (message) {
      notesParts.push(`Message: ${message}`)
    }

    const notes = notesParts.join(' | ')

    // ── Determine the payment method label ─────────────
    let paymentMethod = 'pending'
    if (donationType === 'time') {
      paymentMethod = 'volunteer'
    } else if (donationType === 'resources') {
      paymentMethod = 'in-kind'
    }

    // ── Insert into donations table ────────────────────
    const supabase = createServiceClient()

    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .insert({
        organization_id: SACRED_REVELATION_ORG_ID,
        donor_name: donorName,
        donor_email: donorEmail,
        amount: donationType === 'money' ? amount : (estimatedValue ?? 0),
        type: frequency === 'recurring' ? 'recurring' : 'one-time',
        status: donationType === 'money' ? 'pending' : 'completed',
        payment_method: paymentMethod,
        receipt_number: receiptNumber,
        notes: notes,
      })
      .select()
      .single()

    if (donationError) {
      throw new Error(`Failed to insert donation: ${donationError.message}`)
    }

    // ── Log to activity_logs ───────────────────────────
    const activityDescription =
      donationType === 'money'
        ? `Public donation of $${amount.toLocaleString()} from ${donorName} (${category})`
        : donationType === 'time'
        ? `Volunteer pledge of ${volunteerHours} hrs/week from ${donorName} (${category})`
        : `Resource donation from ${donorName}: ${resourceDescription.slice(0, 80)} (${category})`

    await supabase.from('activity_logs').insert({
      organization_id: SACRED_REVELATION_ORG_ID,
      action: 'public_donation_received',
      description: activityDescription,
      metadata: {
        donation_id: donation.id,
        receipt_number: receiptNumber,
        donation_type: donationType,
        category: category,
        amount: amount,
        donor_email: donorEmail,
        source: 'public_donate_page',
      },
    })

    // ── Return success ─────────────────────────────────
    return NextResponse.json(
      {
        success: true,
        receipt_number: receiptNumber,
        donation_id: donation.id,
        message: 'Donation recorded successfully. Thank you for your generosity.',
      },
      { status: 201 }
    )
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to process donation. Please try again later.' },
      { status: 500 }
    )
  }
}
